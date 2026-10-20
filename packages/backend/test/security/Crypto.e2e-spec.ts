import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { waitFor } from '../setup/wait-for';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import {
    AUTH_COOKIE,
    STRONG_PASSWORD,
    aesDecrypt,
    aesEncrypt,
    cookieValue,
    findSetCookie,
    forgeSessionCookie,
} from './security-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Segurança — Criptografia / Senhas
//
//   - Senhas: armazenadas só como hash bcrypt (com salt e custo adequado),
//     nunca devolvidas pela API nem escritas em log; política de senha forte.
//   - Sessão: JWT assinado (HMAC) e depois cifrado com AES-256-CBC (IV
//     aleatório) dentro de um cookie HttpOnly. Qualquer adulteração, chave
//     errada ou token expirado deve resultar em 401 — nunca em acesso.
// ─────────────────────────────────────────────────────────────────────────────

describe('Segurança — Criptografia / Senhas (e2e)', () => {
    let app: INestApplication;
    let authenticationRepository: AuthenticationRepository;
    let userRepository: UserRepository;
    let aesKey: string;
    let jwtSecret: string;
    const emailProducer = { sendMessage: jest.fn() };

    const email = 'crypto.user@agroscope.test';

    beforeAll(async () => {
        app = await createTestApp([
            { token: 'EmailProducerService', value: emailProducer },
        ]);
        authenticationRepository = app.get('AuthenticationRepository');
        userRepository = app.get('UserRepository');
        aesKey = app.get<string>('AES_KEY');
        jwtSecret = process.env.JWT_SECRET as string;
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        emailProducer.sendMessage.mockClear();
        await clearTables(app, ['authentication', 'user']);
    });

    async function signup(userEmail: string, password = STRONG_PASSWORD) {
        return request(app.getHttpServer()).post('/user').send({
            name: 'Crypto User',
            email: userEmail,
            password,
            acceptedTerms: true,
        });
    }

    async function storedHashFor(userEmail: string): Promise<string> {
        const authentication = await waitFor(async () => {
            const result = await authenticationRepository.findByEmail(userEmail);
            return result.isSuccess() ? result.value : undefined;
        });
        return authentication.password;
    }

    async function login(userEmail = email, password = STRONG_PASSWORD) {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: userEmail, password });
    }

    describe('Armazenamento de senhas', () => {
        it('a senha é salva como hash bcrypt com custo >= 10, nunca em texto plano', async () => {
            await signup(email);
            const hash = await storedHashFor(email);

            expect(hash).not.toBe(STRONG_PASSWORD);
            expect(hash).not.toContain(STRONG_PASSWORD);
            const match = hash.match(/^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/);
            expect(match).not.toBeNull();
            expect(Number(match![1])).toBeGreaterThanOrEqual(10);
        });

        it('o hash armazenado corresponde à senha (bcrypt.compare) e não a outra senha', async () => {
            await signup(email);
            const hash = await storedHashFor(email);

            await expect(compare(STRONG_PASSWORD, hash)).resolves.toBe(true);
            await expect(compare('Outr4-Senha!', hash)).resolves.toBe(false);
        });

        it('usuários com a mesma senha recebem hashes diferentes (salt aleatório)', async () => {
            await signup('crypto.a@agroscope.test');
            await signup('crypto.b@agroscope.test');

            const hashA = await storedHashFor('crypto.a@agroscope.test');
            const hashB = await storedHashFor('crypto.b@agroscope.test');

            expect(hashA).not.toBe(hashB);
        });

        it('após redefinir a senha, a nova também é salva como hash bcrypt e a antiga deixa de funcionar', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            await request(app.getHttpServer())
                .post('/auth/recovery-token')
                .send({ email });
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;

            const newPassword = 'N0va@Senha!';
            const change = await request(app.getHttpServer())
                .post('/auth/change-password')
                .send({ email, token: auth.value.recoveryCode, newPassword });
            expect(change.status).toBe(201);

            const newHash = await storedHashFor(email);
            expect(newHash).toMatch(/^\$2[aby]\$/);
            await expect(compare(newPassword, newHash)).resolves.toBe(true);
            expect((await login(email, STRONG_PASSWORD)).status).toBe(401);
            expect((await login(email, newPassword)).status).toBe(200);
        });
    });

    describe('Senhas nunca são expostas', () => {
        it('nem a senha nem o hash aparecem nas respostas de cadastro, login e /auth/validate', async () => {
            const signupResponse = await signup(email);
            const hash = await storedHashFor(email);
            const loginResponse = await login();
            const cookie = findSetCookie(loginResponse)!.split(';')[0];
            const validateResponse = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', cookie);

            for (const response of [signupResponse, loginResponse, validateResponse]) {
                const body = JSON.stringify(response.body);
                expect(body).not.toContain(STRONG_PASSWORD);
                expect(body).not.toContain(hash);
                expect(body.toLowerCase()).not.toContain('"password"');
            }
        });

        it('o payload do JWT dentro do cookie não carrega senha nem hash', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            const setCookie = findSetCookie(await login())!;

            const token = aesDecrypt(cookieValue(setCookie), aesKey);
            const payload = jwt.decode(token) as Record<string, unknown>;

            expect(payload.sub).toBeDefined();
            expect(payload.email).toBe(email);
            expect(Object.keys(payload)).not.toContain('password');
            expect(JSON.stringify(payload)).not.toContain('$2');
        });

        it('o token de recuperação de senha não é devolvido na resposta HTTP (só por e-mail)', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

            const response = await request(app.getHttpServer())
                .post('/auth/recovery-token')
                .send({ email });

            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;
            expect(response.status).toBe(201);
            expect(JSON.stringify(response.body)).not.toContain(auth.value.recoveryCode);
        });

        it('a senha em texto plano não é escrita nos logs da aplicação', async () => {
            const logged: string[] = [];
            const capture = (message: unknown) => {
                logged.push(String(message));
            };
            const spies = (['log', 'debug', 'error', 'warn', 'verbose'] as const).map(
                (method) =>
                    jest.spyOn(Logger.prototype, method).mockImplementation(capture),
            );

            try {
                await signup(email);
                await storedHashFor(email);
                await login(email, STRONG_PASSWORD);
                await login(email, 'S3nha-Errada!');
            } finally {
                spies.forEach((spy) => spy.mockRestore());
            }

            expect(logged.length).toBeGreaterThan(0);
            const allLogs = logged.join('\n');
            expect(allLogs).not.toContain(STRONG_PASSWORD);
            expect(allLogs).not.toContain('S3nha-Errada!');
        });
    });

    describe('Política de senha forte', () => {
        const weakPasswords: Array<[string, string]> = [
            ['vazia', ''],
            ['curta (< 8)', 'Ab1!'],
            ['só números', '12345678'],
            ['sem maiúscula', 'senha@123'],
            ['sem minúscula', 'SENHA@123'],
            ['sem número', 'Senha@abc'],
            ['sem símbolo', 'Senha1234'],
            ['senha comum', 'password'],
        ];

        it.each(weakPasswords)(
            'recusa o cadastro com senha %s e não cria a conta',
            async (_label, weakPassword) => {
                const userEmail = `weak.${Date.now()}@agroscope.test`;
                const response = await signup(userEmail, weakPassword);

                expect(response.status).toBe(400);
                const user = await userRepository.getByEmail(userEmail);
                expect(user.isFailure()).toBe(true);
            },
        );

        it('recusa senha fraca também na redefinição de senha, mesmo com o código correto', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            await request(app.getHttpServer())
                .post('/auth/recovery-token')
                .send({ email });
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;

            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .send({ email, token: auth.value.recoveryCode, newPassword: '123456' });

            expect(response.status).toBe(400);
            expect((await login(email, '123456')).status).toBe(401);
            expect((await login(email, STRONG_PASSWORD)).status).toBe(200);
        });
    });

    describe('Mensagens de erro de login não revelam se o e-mail existe', () => {
        it('e-mail inexistente e senha errada recebem exatamente a mesma resposta', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

            const wrongPassword = await login(email, 'S3nha-Errada!');
            const unknownEmail = await login('nao.existe@agroscope.test', 'S3nha-Errada!');

            expect(wrongPassword.status).toBe(401);
            expect(unknownEmail.status).toBe(401);
            expect(unknownEmail.body).toEqual(wrongPassword.body);
        });
    });

    describe('Cookie de sessão (JWT + AES)', () => {
        beforeEach(async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
        });

        it('o cookie é HttpOnly, tem SameSite e expira (Max-Age)', async () => {
            const setCookie = findSetCookie(await login())!;
            const flags = setCookie.toLowerCase();

            expect(flags).toContain('httponly');
            expect(flags).toMatch(/samesite=(lax|strict|none)/);
            expect(flags).toMatch(/max-age=\d+/);
        });

        it('o valor do cookie é "iv:ciphertext" AES (IV de 16 bytes), não um JWT legível', async () => {
            const value = cookieValue(findSetCookie(await login())!);

            expect(value).not.toMatch(/^eyJ/);
            expect(value).not.toContain(email);

            const [iv, ciphertext] = value.split(':');
            expect(Buffer.from(iv, 'base64')).toHaveLength(16);
            expect(Buffer.from(ciphertext, 'base64').length % 16).toBe(0);

            const token = aesDecrypt(value, aesKey);
            expect(token).toMatch(/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/);
            expect(() => jwt.verify(token, jwtSecret)).not.toThrow();
        });

        it('dois logins seguidos geram cookies diferentes (IV aleatório)', async () => {
            const first = cookieValue(findSetCookie(await login())!);
            const second = cookieValue(findSetCookie(await login())!);

            expect(first).not.toBe(second);
            expect(first.split(':')[0]).not.toBe(second.split(':')[0]);
        });

        it('recusa (401) o JWT válido enviado sem a camada AES', async () => {
            const token = aesDecrypt(cookieValue(findSetCookie(await login())!), aesKey);

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', `${AUTH_COOKIE}=${token}`);

            expect(response.status).toBe(401);
        });

        it('recusa (401) um cookie com o ciphertext adulterado', async () => {
            const value = cookieValue(findSetCookie(await login())!);
            const [iv, ciphertext] = value.split(':');
            const bytes = Buffer.from(ciphertext, 'base64');
            bytes[bytes.length - 1] ^= 0xff;
            const tampered = `${iv}:${bytes.toString('base64')}`;

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', `${AUTH_COOKIE}=${encodeURIComponent(tampered)}`);

            expect(response.status).toBe(401);
        });

        it('recusa (401) um JWT válido cifrado com outra chave AES', async () => {
            const token = aesDecrypt(cookieValue(findSetCookie(await login())!), aesKey);
            const otherKey = 'f'.repeat(64);

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set(
                    'Cookie',
                    `${AUTH_COOKIE}=${encodeURIComponent(aesEncrypt(token, otherKey))}`,
                );

            expect(response.status).toBe(401);
        });

        it('recusa (401) um JWT forjado com outro segredo, mesmo cifrado com a chave AES correta', async () => {
            const forged = forgeSessionCookie(
                { sub: 'qualquer-id', email, name: 'Forjado' },
                { jwtSecret: 'segredo-adivinhado', aesKey },
            );

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', forged);

            expect(response.status).toBe(401);
        });

        it('recusa (401) um JWT com algoritmo "none" (sem assinatura)', async () => {
            const unsigned = jwt.sign({ sub: 'qualquer-id', email }, '', {
                algorithm: 'none',
            });
            const cookie = `${AUTH_COOKIE}=${encodeURIComponent(aesEncrypt(unsigned, aesKey))}`;

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', cookie);

            expect(response.status).toBe(401);
        });

        it('recusa (401) um JWT expirado', async () => {
            const expired = forgeSessionCookie(
                { sub: 'qualquer-id', email, name: 'Expirado' },
                { jwtSecret, aesKey, expiresIn: -60 },
            );

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', expired);

            expect(response.status).toBe(401);
        });

        it('logout apaga o cookie de sessão (expira no cliente)', async () => {
            const response = await request(app.getHttpServer()).post('/auth/logout');
            const setCookie = findSetCookie(response)!;

            expect(setCookie).toMatch(new RegExp(`^${AUTH_COOKIE}=;`));
            expect(setCookie).toMatch(/Expires=Thu, 01 Jan 1970/);
        });
    });
});
