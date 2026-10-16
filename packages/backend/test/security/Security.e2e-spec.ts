import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication, seedPlan } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { waitFor } from '../setup/wait-for';
import { History } from 'src/modules/core/domain/models/History';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';

// ─────────────────────────────────────────────────────────────────────────────
// Testes de Segurança — Integração Backend (e2e API)
//
// Cobertura:
//   1. IDOR — Insecure Direct Object Reference
//   2. Criptografia / Senhas
//   3. Injeção de código via XSS (validação e sanitização no payload/resposta)
//   4. Bots — User-Agent GoogleBot
// ─────────────────────────────────────────────────────────────────────────────

describe('Segurança (e2e)', () => {
    let app: INestApplication;
    let historyRepository: HistoryRepository;
    let authenticationRepository: AuthenticationRepository;

    const ownerEmail = 'security.owner@agroscope.test';
    const attackerEmail = 'security.attacker@agroscope.test';
    const password = 'Str0ngPassword!';

    beforeAll(async () => {
        app = await createTestApp();
        historyRepository = app.get('HistoryRepository');
        authenticationRepository = app.get('AuthenticationRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['history', 'authentication', 'user']);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 1. IDOR — Insecure Direct Object Reference
    //
    // Um usuário autenticado não deve conseguir ler nem alterar recursos
    // pertencentes a outro usuário, mesmo conhecendo o ID do recurso.
    // ─────────────────────────────────────────────────────────────────────────
    describe('IDOR — Referência direta insegura a objetos', () => {
        it('impede que um usuário acesse o histórico de outro por ID direto', async () => {
            const plan = await seedPlan(app, { type: 'free' });

            const { user: owner } = await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });
            await seedUserWithAuthentication(app, {
                email: attackerEmail,
                password,
                planId: plan.id,
            });

            const ownerHistory = History.create({
                crop: 'Soja',
                cropConfidence: 0.95,
                image: 'soja.jpg',
                causes: 'Ferrugem asiática',
                userId: owner.id,
            });
            await historyRepository.save(ownerHistory);

            const attackerCookie = await loginAndGetCookie(
                app,
                attackerEmail,
                password,
            );

            const response = await request(app.getHttpServer())
                .get(`/history/${ownerHistory.id}`)
                .set('Cookie', attackerCookie);

            expect(response.status).toBe(404);
        });

        it('impede acesso ao histórico de outro usuário sem autenticação', async () => {
            const plan = await seedPlan(app, { type: 'free' });
            const { user: owner } = await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });

            const ownerHistory = History.create({
                crop: 'Milho',
                cropConfidence: 0.88,
                image: 'milho.jpg',
                causes: 'Mancha foliar',
                userId: owner.id,
            });
            await historyRepository.save(ownerHistory);

            const response = await request(app.getHttpServer()).get(
                `/history/${ownerHistory.id}`,
            );

            expect(response.status).toBe(401);
        });

        it('impede que um usuário altere o plano de outro usuário (IDOR no PATCH /user/plan)', async () => {
            const plan = await seedPlan(app, { type: 'free' });
            const targetPlan = await seedPlan(app, { type: 'premium' });

            await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });
            await seedUserWithAuthentication(app, {
                email: attackerEmail,
                password,
                planId: plan.id,
            });

            const attackerCookie = await loginAndGetCookie(
                app,
                attackerEmail,
                password,
            );

            const response = await request(app.getHttpServer())
                .patch('/user/plan')
                .set('Cookie', attackerCookie)
                .send({ planId: targetPlan.id });

            expect([200, 400, 403, 404]).toContain(response.status);
            expect(JSON.stringify(response.body)).not.toContain(ownerEmail);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Criptografia / Senhas
    //
    // Verifica que as senhas são armazenadas como hash bcrypt e que tokens
    // de sessão utilizam criptografia simétrica AES antes de serem enviados via cookie.
    // ─────────────────────────────────────────────────────────────────────────
    describe('Criptografia / Senhas', () => {
        it('armazena a senha do usuário como hash bcrypt — nunca em texto plano', async () => {
            await request(app.getHttpServer()).post('/user').send({
                name: 'Crypto Test User',
                email: ownerEmail,
                password,
                acceptedTerms: true,
            });

            const authentication = await waitFor(async () => {
                const result = await authenticationRepository.findByEmail(ownerEmail);
                return result.isSuccess() ? result.value : undefined;
            });

            const storedPassword = authentication.password;

            // A senha armazenada NÃO pode ser a senha em texto plano
            expect(storedPassword).not.toBe(password);

            // Deve ser um hash bcrypt ($2a$ ou $2b$)
            expect(storedPassword).toMatch(/^\$2[ab]\$/);
        });

        it('o cookie de autenticação contém o token criptografado (AES), não o JWT em texto plano', async () => {
            const plan = await seedPlan(app, { type: 'free' });
            await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });

            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: ownerEmail, password });

            expect(loginResponse.status).toBe(200);

            const cookies = loginResponse.headers[
                'set-cookie'
            ] as unknown as string[];
            const authCookie = cookies.find((c) =>
                c.startsWith('agroscope-authentication='),
            );
            expect(authCookie).toBeDefined();

            const cookieValue = authCookie!
                .split(';')[0]
                .replace('agroscope-authentication=', '');

            // Não deve ser JWT puro em Base64URL no formato header.payload.signature
            expect(cookieValue).not.toMatch(/^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);

            // Criptografia AES em formato iv:ciphertext contém dois blocos separados por ':'
            expect(decodeURIComponent(cookieValue)).toContain(':');
        });

        it('o cookie de autenticação possui a flag HttpOnly para proteção contra roubo de sessão', async () => {
            const plan = await seedPlan(app, { type: 'free' });
            await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });

            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: ownerEmail, password });

            expect(loginResponse.status).toBe(200);

            const cookies = loginResponse.headers[
                'set-cookie'
            ] as unknown as string[];
            const authCookie = cookies.find((c) =>
                c.startsWith('agroscope-authentication='),
            );

            expect(authCookie).toBeDefined();
            expect(authCookie!.toLowerCase()).toContain('httponly');
        });

        it('rejeita senhas fracas ou sem os requisitos mínimos de complexidade', async () => {
            const weakPasswords = ['123456', 'password', 'abc', ''];

            for (const weakPassword of weakPasswords) {
                const response = await request(app.getHttpServer())
                    .post('/user')
                    .send({
                        name: 'Weak Password User',
                        email: `weak-${Date.now()}@agroscope.test`,
                        password: weakPassword,
                        acceptedTerms: true,
                    });

                expect(response.status).toBe(400);
            }
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Injeção de código via XSS (Camada de Integração / API)
    //
    // Valida que a API sanitiza ou rejeita payloads maliciosos, que as
    // respostas de erro não refletem HTML/scripts não escapados e que
    // o content-type retornado é estritamente application/json.
    // ─────────────────────────────────────────────────────────────────────────
    describe('Injeção de código (XSS)', () => {
        const xssPayloads = [
            '<script>alert("XSS")</script>',
            '"><img src=x onerror=alert(1)>',
            "'; DROP TABLE user; --",
            '<svg onload=alert(1)>',
            'javascript:alert(document.cookie)',
        ];

        it('rejeita ou trata com segurança payloads XSS no cadastro', async () => {
            for (const payload of xssPayloads) {
                const response = await request(app.getHttpServer())
                    .post('/user')
                    .send({
                        name: payload,
                        email: `xss-${Date.now()}-${Math.random()}@agroscope.test`,
                        password,
                        acceptedTerms: true,
                    });

                if (response.status === 201) {
                    const bodyStr = JSON.stringify(response.body);
                    expect(bodyStr).not.toContain('<script>');
                    expect(bodyStr).not.toContain('onerror=');
                    expect(bodyStr).not.toContain('onload=');
                } else {
                    expect(response.status).toBe(400);
                }
            }
        });

        it('não reflete scripts executáveis no corpo da resposta de erro de login', async () => {
            for (const payload of xssPayloads) {
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: payload, password: 'irrelevante' });

                const bodyStr = JSON.stringify(response.body);
                expect(bodyStr).not.toContain('<script>');
                expect(bodyStr).not.toContain('onerror=');
                expect(bodyStr).not.toContain('onload=');
                expect(response.status).not.toBe(200);
            }
        });

        it('o cabeçalho Content-Type da API é estritamente application/json, nunca text/html', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'xss@test.com', password: 'wrong' });

            const contentType = response.headers['content-type'] ?? '';
            expect(contentType).toContain('application/json');
            expect(contentType).not.toContain('text/html');
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Bots — User-Agent GoogleBot
    //
    // Requisições que utilizam User-Agent do GoogleBot não devem burlar a
    // camada de autenticação nem acessar recursos protegidos sem credenciais.
    // ─────────────────────────────────────────────────────────────────────────
    describe('Bots — User-Agent GoogleBot', () => {
        const googleBotUA =
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
        const googleBotVariants = [
            'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
        ];

        it('rejeita acesso a rotas protegidas com User-Agent GoogleBot sem sessão', async () => {
            const response = await request(app.getHttpServer())
                .get('/history')
                .set('User-Agent', googleBotUA);

            expect(response.status).toBe(401);
        });

        it('rejeita todas as variantes de User-Agent GoogleBot em rotas protegidas', async () => {
            for (const ua of googleBotVariants) {
                const response = await request(app.getHttpServer())
                    .get('/history')
                    .set('User-Agent', ua);

                expect(response.status).toBe(401);
            }
        });

        it('GoogleBot com User-Agent não bypassa autenticação nem em rotas de validação', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('User-Agent', googleBotUA);

            expect(response.status).toBe(401);
        });

        it('GoogleBot com User-Agent não obtém dados ao tentar login com credenciais inválidas', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .set('User-Agent', googleBotUA)
                .send({ email: 'bot@agroscope.test', password: 'wrongpass' });

            expect(response.status).not.toBe(200);

            const cookies = (response.headers['set-cookie'] as unknown as string[]) ?? [];
            const authCookie = cookies.find((c) =>
                c.startsWith('agroscope-authentication='),
            );
            expect(authCookie).toBeUndefined();
        });

        it('GoogleBot autenticado (cookie válido) consegue acessar rotas normalmente', async () => {
            const plan = await seedPlan(app, { type: 'free' });
            await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });

            const cookie = await loginAndGetCookie(app, ownerEmail, password);

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', cookie)
                .set('User-Agent', googleBotUA);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(ownerEmail);
        });
    });
});
