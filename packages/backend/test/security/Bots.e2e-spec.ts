import { INestApplication } from '@nestjs/common';
import { resetRateLimit as resetSharedRateLimit } from '../setup/rate-limit';
import * as request from 'supertest';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { STRONG_PASSWORD, findSetCookie } from './security-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Segurança — Bots (automação maliciosa)
//
//   1. Rate limiting (@nestjs/throttler): brute force de login, flood de
//      recuperação de senha (e-mail bombing), criação em massa de contas e
//      scraping autenticado recebem 429 — e trocar User-Agent ou forjar
//      X-Forwarded-For não reinicia o contador.
//   2. Bloqueio de conta: credential stuffing é barrado por conta (5 erros),
//      independente do IP.
//   3. Brute force do código de recuperação (6 dígitos): limite de tentativas.
//   4. User-Agent de bots "confiáveis" (Googlebot etc.) não dá acesso a nada.
//
// Os limites do throttler são lidos do ambiente quando o AppModule é
// importado, por isso este arquivo define limites baixos ANTES de importar o
// app (import dinâmico no beforeAll) e restaura o ambiente no afterAll.
// ─────────────────────────────────────────────────────────────────────────────

const LOGIN_LIMIT = 5;
const GLOBAL_LIMIT = 20;

const THROTTLE_ENV: Record<string, string> = {
    THROTTLE_SHORT_TTL: '1000',
    THROTTLE_SHORT_LIMIT: '1000',
    THROTTLE_MEDIUM_TTL: '60000',
    THROTTLE_MEDIUM_LIMIT: String(GLOBAL_LIMIT),
    THROTTLE_LONG_TTL: '3600000',
    THROTTLE_LONG_LIMIT: '100000',
    THROTTLE_LOGIN_LIMIT: String(LOGIN_LIMIT),
};

const BOT_USER_AGENTS = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
    'python-requests/2.31.0',
    'curl/8.4.0',
    '',
];

describe('Segurança — Bots (e2e)', () => {
    let app: INestApplication;
    let authenticationRepository: AuthenticationRepository;
    const originalEnv: Record<string, string | undefined> = {};
    const emailProducer = { sendMessage: jest.fn() };

    const email = 'bots.victim@agroscope.test';

    beforeAll(async () => {
        for (const [key, value] of Object.entries(THROTTLE_ENV)) {
            originalEnv[key] = process.env[key];
            process.env[key] = value;
        }

        const { createTestApp } = await import('../setup/test-app');
        app = await createTestApp([
            { token: 'EmailProducerService', value: emailProducer },
        ]);
        authenticationRepository = app.get('AuthenticationRepository');
    });

    afterAll(async () => {
        await app.close();
        for (const [key, value] of Object.entries(originalEnv)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });

    beforeEach(async () => {
        resetRateLimit();
        emailProducer.sendMessage.mockClear();
        await clearTables(app, ['history', 'authentication', 'user']);
        await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
    });

    function resetRateLimit() {
        resetSharedRateLimit(app);
    }

    function login(password: string, headers: Record<string, string> = {}) {
        const req = request(app.getHttpServer()).post('/auth/login');
        for (const [name, value] of Object.entries(headers)) req.set(name, value);
        return req.send({ email, password });
    }

    describe('Rate limiting', () => {
        it(`brute force de login: a requisição ${LOGIN_LIMIT + 1} em 1 minuto recebe 429 com Retry-After`, async () => {
            for (let i = 0; i < LOGIN_LIMIT; i++) {
                const response = await login(`Tentativa-${i}!`);
                expect(response.status).toBe(401);
            }

            const blocked = await login('Mais-Uma-1!');

            expect(blocked.status).toBe(429);
            const retryAfter = Object.keys(blocked.headers).find((h) =>
                h.startsWith('retry-after'),
            );
            expect(retryAfter).toBeDefined();
        });

        it('quando o limite estoura, nem a senha correta autentica (o bot não descobre que acertou)', async () => {
            // Gasta o limite com outro e-mail, para não acionar o bloqueio de
            // conta da vítima — aqui só o rate limit deve barrar.
            for (let i = 0; i < LOGIN_LIMIT; i++) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: 'outro@agroscope.test', password: 'x' });
            }

            const response = await login(STRONG_PASSWORD);

            expect(response.status).toBe(429);
            expect(findSetCookie(response)).toBeUndefined();
        });

        it('trocar o User-Agent a cada requisição não reinicia o contador', async () => {
            const statuses: number[] = [];
            for (const userAgent of BOT_USER_AGENTS.slice(0, LOGIN_LIMIT + 2)) {
                const response = await login('Errada-123!', { 'User-Agent': userAgent });
                statuses.push(response.status);
            }

            expect(statuses.slice(0, LOGIN_LIMIT).every((s) => s === 401)).toBe(true);
            expect(statuses.slice(LOGIN_LIMIT)).toEqual([429, 429]);
        });

        it('forjar X-Forwarded-For / X-Real-IP (IP aleatório por requisição) não burla o limite', async () => {
            const statuses: number[] = [];
            for (let i = 0; i < LOGIN_LIMIT + 2; i++) {
                const fakeIp = `203.0.113.${i + 1}`;
                const response = await login('Errada-123!', {
                    'X-Forwarded-For': fakeIp,
                    'X-Real-IP': fakeIp,
                    'X-Client-IP': fakeIp,
                });
                statuses.push(response.status);
            }

            expect(statuses.slice(LOGIN_LIMIT)).toEqual([429, 429]);
        });

        it('flood de pedidos de recuperação de senha (e-mail bombing) é barrado com 429', async () => {
            const statuses: number[] = [];
            for (let i = 0; i < LOGIN_LIMIT + 2; i++) {
                const response = await request(app.getHttpServer())
                    .post('/auth/recovery-token')
                    .send({ email });
                statuses.push(response.status);
            }

            expect(statuses.slice(LOGIN_LIMIT)).toEqual([429, 429]);
            expect(emailProducer.sendMessage).toHaveBeenCalledTimes(LOGIN_LIMIT);
        });

        it(`criação de contas em massa: o cadastro ${GLOBAL_LIMIT + 1} em 1 minuto recebe 429`, async () => {
            const statuses: number[] = [];
            for (let i = 0; i < GLOBAL_LIMIT + 1; i++) {
                const response = await request(app.getHttpServer())
                    .post('/user')
                    .set('User-Agent', BOT_USER_AGENTS[i % BOT_USER_AGENTS.length])
                    .send({
                        name: `Bot ${i}`,
                        email: `bot.${i}@agroscope.test`,
                        password: STRONG_PASSWORD,
                        acceptedTerms: true,
                    });
                statuses.push(response.status);
            }

            expect(statuses.slice(0, GLOBAL_LIMIT).every((s) => s === 201)).toBe(true);
            expect(statuses[GLOBAL_LIMIT]).toBe(429);
        });

        it('scraping autenticado: um bot com sessão válida também é limitado', async () => {
            const cookie = await loginAndGetCookie(app, email, STRONG_PASSWORD);

            const statuses: number[] = [];
            for (let i = 0; i < GLOBAL_LIMIT + 1; i++) {
                const response = await request(app.getHttpServer())
                    .get('/history')
                    .set('Cookie', cookie)
                    .set('User-Agent', BOT_USER_AGENTS[0]);
                statuses.push(response.status);
            }

            expect(statuses.slice(0, GLOBAL_LIMIT).every((s) => s === 200)).toBe(true);
            expect(statuses[GLOBAL_LIMIT]).toBe(429);
        });

        it('as respostas expõem os cabeçalhos X-RateLimit (limite e restante)', async () => {
            const response = await login('Errada-123!');

            const headers = Object.keys(response.headers);
            expect(headers.some((h) => h.startsWith('x-ratelimit-limit'))).toBe(true);
            expect(headers.some((h) => h.startsWith('x-ratelimit-remaining'))).toBe(true);
        });
    });

    describe('Bloqueio de conta (credential stuffing)', () => {
        it('após 5 senhas erradas a conta é bloqueada e nem a senha correta funciona', async () => {
            for (let i = 0; i < 5; i++) {
                resetRateLimit();
                await login(`Errada-${i}!`, { 'X-Forwarded-For': `198.51.100.${i}` });
            }
            resetRateLimit();

            const response = await login(STRONG_PASSWORD);

            expect(response.status).toBe(401);
            expect(findSetCookie(response)).toBeUndefined();
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;
            expect(auth.value.incorrectPasswordAttempts).toBeGreaterThanOrEqual(5);
        });

        it('erros abaixo do limite são zerados após um login bem-sucedido', async () => {
            for (let i = 0; i < 4; i++) await login(`Errada-${i}!`);
            resetRateLimit();

            expect((await login(STRONG_PASSWORD)).status).toBe(200);

            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;
            expect(auth.value.incorrectPasswordAttempts).toBe(0);
        });
    });

    describe('Brute force do código de recuperação de senha', () => {
        async function requestRecoveryCode(): Promise<string> {
            await request(app.getHttpServer())
                .post('/auth/recovery-token')
                .send({ email });
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;
            return auth.value.recoveryCode;
        }

        function wrongCode(code: string, offset: number): string {
            return String((Number(code) + offset) % 1_000_000).padStart(6, '0');
        }

        it('após 5 códigos errados em /auth/validate-recovery-token, o código correto é recusado', async () => {
            const code = await requestRecoveryCode();

            for (let i = 1; i <= 5; i++) {
                const response = await request(app.getHttpServer())
                    .post('/auth/validate-recovery-token')
                    .send({ email, token: wrongCode(code, i) });
                expect(response.status).toBe(400);
            }

            const response = await request(app.getHttpServer())
                .post('/auth/validate-recovery-token')
                .send({ email, token: code });

            expect(response.status).toBe(400);
        });

        it('após 5 códigos errados em /auth/change-password, a senha não pode mais ser trocada com o código correto', async () => {
            const code = await requestRecoveryCode();

            for (let i = 1; i <= 5; i++) {
                await request(app.getHttpServer())
                    .post('/auth/change-password')
                    .send({ email, token: wrongCode(code, i), newPassword: 'H4cked@Senha!' });
            }

            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .send({ email, token: code, newPassword: 'H4cked@Senha!' });

            expect(response.status).toBe(400);
            resetRateLimit();
            expect((await login(STRONG_PASSWORD)).status).toBe(200);
        });
    });

    describe('User-Agent de bots não concede acesso', () => {
        it.each(BOT_USER_AGENTS)(
            'User-Agent %p sem sessão recebe 401 nas rotas protegidas',
            async (userAgent) => {
                for (const route of ['/history', '/auth/validate', '/limit', '/chat/sessions']) {
                    const response = await request(app.getHttpServer())
                        .get(route)
                        .set('User-Agent', userAgent);
                    expect(response.status).toBe(401);
                }
            },
        );

        it('Googlebot não recebe cookie de sessão com credenciais inválidas', async () => {
            const response = await login('Errada-123!', { 'User-Agent': BOT_USER_AGENTS[0] });

            expect(response.status).toBe(401);
            expect(findSetCookie(response)).toBeUndefined();
        });
    });
});
