import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import {
    STRONG_PASSWORD,
    findSetCookie,
    seedHistory,
    seedVictimAndAttacker,
} from './security-helpers';
import { formatPersonName } from 'src/modules/core/domain/models/UserProfileRules';
import { resetRateLimit } from '../setup/rate-limit';

// ─────────────────────────────────────────────────────────────────────────────
// Segurança — Injeção de código
//
//   1. SQL Injection: payloads clássicos em todos os pontos onde o input do
//      usuário chega ao banco (login, filtros, path params). O TypeORM usa
//      queries parametrizadas — os testes provam que o payload vira só texto.
//   2. Injeção de operadores/tipos (estilo NoSQL): objetos, arrays e campos
//      ausentes no lugar de strings não podem virar "WHERE sem filtro".
//   3. XSS na API: payloads não são refletidos em respostas de erro e a API
//      só responde JSON (o teste com browser real fica no e2e-web).
//   4. Upload malicioso: extensão executável e path traversal no nome.
// ─────────────────────────────────────────────────────────────────────────────

const SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1 --",
    "admin@agroscope.test'--",
    "' UNION SELECT id, email, password FROM authentication --",
    "'; DROP TABLE \"user\"; --",
    "1; UPDATE authentication SET password = 'x' --",
    "' OR pg_sleep(5) IS NULL --",
];

const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '"><img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(document.cookie)',
    '<iframe src="javascript:alert(1)"></iframe>',
];

describe('Segurança — Injeção de código (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;
    let authenticationRepository: AuthenticationRepository;
    const emailProducer = { sendMessage: jest.fn() };

    const email = 'injection.user@agroscope.test';

    beforeAll(async () => {
        app = await createTestApp([
            { token: 'EmailProducerService', value: emailProducer },
        ]);
        dataSource = app.get(DataSource);
        userRepository = app.get('UserRepository');
        authenticationRepository = app.get('AuthenticationRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        resetRateLimit(app);
        await clearTables(app, ['history', 'authentication', 'user']);
    });

    async function countRows(table: string): Promise<number> {
        const [{ count }] = await dataSource.query(
            `SELECT COUNT(*)::int AS count FROM "${table}"`,
        );
        return count;
    }

    describe('SQL Injection', () => {
        it.each(SQL_INJECTION_PAYLOADS)(
            'login com e-mail %p não autentica e não emite cookie',
            async (payload) => {
                await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: payload, password: payload });

                expect(response.status).toBe(401);
                expect(findSetCookie(response)).toBeUndefined();
            },
        );

        it('login com e-mail válido e senha com SQL injection não autentica', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email, password: "' OR '1'='1" });

            expect(response.status).toBe(401);
            expect(findSetCookie(response)).toBeUndefined();
        });

        it('payload de time-based SQLi (pg_sleep) não atrasa a resposta', async () => {
            const start = Date.now();
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: "' OR pg_sleep(5) IS NULL --", password: 'x' });

            expect(Date.now() - start).toBeLessThan(3000);
        });

        it('payloads destrutivos (DROP/UPDATE) não alteram o banco', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            const before = await authenticationRepository.findByEmail(email);
            if (before.isFailure()) throw before.error;

            for (const payload of SQL_INJECTION_PAYLOADS) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: payload, password: 'x' });
                await request(app.getHttpServer())
                    .post('/auth/recovery-token')
                    .send({ email: payload });
            }

            expect(await countRows('user')).toBe(1);
            expect(await countRows('authentication')).toBe(1);
            const after = await authenticationRepository.findByEmail(email);
            if (after.isFailure()) throw after.error;
            expect(after.value.password).toBe(before.value.password);
        });

        it.each(SQL_INJECTION_PAYLOADS)(
            'filtro GET /history?crop=%p não retorna análises de outros usuários',
            async (payload) => {
                const { victim, attacker } = await seedVictimAndAttacker(app, 'sqli-crop');
                await seedHistory(app, victim.user.id);

                const response = await request(app.getHttpServer())
                    .get('/history')
                    .query({ crop: payload })
                    .set('Cookie', attacker.cookie);

                expect(response.status).toBeLessThan(500);
                expect(JSON.stringify(response.body)).not.toContain('confidencial');
            },
        );

        it.each(SQL_INJECTION_PAYLOADS)(
            'path param GET /history/%p não retorna dados nem erro 500',
            async (payload) => {
                const { victim, attacker } = await seedVictimAndAttacker(app, 'sqli-id');
                await seedHistory(app, victim.user.id);

                const response = await request(app.getHttpServer())
                    .get(`/history/${encodeURIComponent(payload)}`)
                    .set('Cookie', attacker.cookie);

                expect(response.status).toBe(404);
                expect(JSON.stringify(response.body)).not.toContain('confidencial');
            },
        );

        it('parâmetros de analytics (granularity/datas) com SQL injection não vazam dados nem quebram a API', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'sqli-analytics');
            await seedHistory(app, victim.user.id);

            for (const payload of SQL_INJECTION_PAYLOADS) {
                const response = await request(app.getHttpServer())
                    .get('/history/analytics')
                    .query({ granularity: payload, startDate: payload, endDate: payload })
                    .set('Cookie', attacker.cookie);

                expect(response.status).toBeLessThan(500);
                expect(JSON.stringify(response.body)).not.toContain('confidencial');
            }

            const ok = await request(app.getHttpServer())
                .get('/history/analytics')
                .query({ granularity: "month'; DROP TABLE history; --" })
                .set('Cookie', attacker.cookie);
            expect(ok.status).toBe(200);
            expect(ok.body.totalAnalyses).toBe(0);
            expect(await countRows('history')).toBe(1);
        });

        it('sessionId do chat com SQL injection não retorna mensagens de ninguém', async () => {
            const { attacker } = await seedVictimAndAttacker(app, 'sqli-chat');

            const response = await request(app.getHttpServer())
                .get('/chat/history')
                .query({ sessionId: "' OR '1'='1" })
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('cadastro com SQL injection no nome salva o texto literalmente, sem executar nada', async () => {
            const payload = "Robert'); DROP TABLE \"user\"; --";

            const response = await request(app.getHttpServer()).post('/user').send({
                name: payload,
                email,
                password: STRONG_PASSWORD,
                acceptedTerms: true,
            });

            expect(response.status).toBe(201);
            const user = await userRepository.getByEmail(email);
            if (user.isFailure()) throw user.error;
            expect(user.value.name).toBe(formatPersonName(payload));
            expect(await countRows('user')).toBe(1);
        });
    });

    describe('Injeção de operadores / tipos (estilo NoSQL)', () => {
        const operatorPayloads: Array<[string, unknown]> = [
            ['objeto vazio', {}],
            ['operador $ne', { $ne: null }],
            ['operador $gt', { $gt: '' }],
            ['array', [email]],
            ['null', null],
            ['número', 0],
            ['booleano', true],
        ];

        it.each(operatorPayloads)(
            'login com e-mail = %s não autentica, mesmo com a senha correta da vítima',
            async (_label, payload) => {
                await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: payload, password: STRONG_PASSWORD });

                expect([400, 401]).toContain(response.status);
                expect(findSetCookie(response)).toBeUndefined();
            },
        );

        it('login SEM o campo e-mail não autentica como "o primeiro usuário do banco"', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ password: STRONG_PASSWORD });

            expect([400, 401]).toContain(response.status);
            expect(findSetCookie(response)).toBeUndefined();
        });

        it('senha enviada como objeto/array não autentica nem derruba a API', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });

            for (const password of [{ $ne: null }, [STRONG_PASSWORD], {}, null]) {
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email, password });

                expect([400, 401]).toContain(response.status);
                expect(findSetCookie(response)).toBeUndefined();
            }
        });

        it('pedido de recuperação SEM e-mail não gera token para nenhuma conta', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            emailProducer.sendMessage.mockClear();

            for (const body of [{}, { email: {} }, { email: null }]) {
                const response = await request(app.getHttpServer())
                    .post('/auth/recovery-token')
                    .send(body);
                expect(response.status).toBe(400);
            }

            expect(emailProducer.sendMessage).not.toHaveBeenCalled();
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;
            expect(auth.value.recoveryCode).toBeFalsy();
        });

        it('troca de senha SEM e-mail não altera a senha de nenhuma conta', async () => {
            await seedUserWithAuthentication(app, { email, password: STRONG_PASSWORD });
            await request(app.getHttpServer())
                .post('/auth/recovery-token')
                .send({ email });
            const auth = await authenticationRepository.findByEmail(email);
            if (auth.isFailure()) throw auth.error;

            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .send({ token: auth.value.recoveryCode, newPassword: 'H4cked@Senha!' });

            expect(response.status).toBe(400);
            const login = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email, password: STRONG_PASSWORD });
            expect(login.status).toBe(200);
        });

        it('campos extras no cadastro (mass assignment) são descartados', async () => {
            const response = await request(app.getHttpServer()).post('/user').send({
                name: 'Usuário Comum',
                email,
                password: STRONG_PASSWORD,
                acceptedTerms: true,
                admin: true,
                engineer: true,
                id: '00000000-0000-4000-8000-000000000000',
            });

            expect(response.status).toBe(201);
            const user = await userRepository.getByEmail(email);
            if (user.isFailure()) throw user.error;
            expect(user.value.id).not.toBe('00000000-0000-4000-8000-000000000000');

            const login = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email, password: STRONG_PASSWORD });
            const cookie = findSetCookie(login)!.split(';')[0];
            const validate = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', cookie);
            expect(validate.body.isAdmin).toBeFalsy();
            expect(validate.body.isEngineer).toBeFalsy();
        });
    });

    describe('XSS na camada de API', () => {
        it.each(XSS_PAYLOADS)(
            'e-mail com payload %p é recusado no cadastro (400)',
            async (payload) => {
                const response = await request(app.getHttpServer()).post('/user').send({
                    name: 'Teste XSS',
                    email: payload,
                    password: STRONG_PASSWORD,
                    acceptedTerms: true,
                });

                expect(response.status).toBe(400);
                expect(JSON.stringify(response.body)).not.toContain(payload);
            },
        );

        it.each(XSS_PAYLOADS)(
            'login com payload %p não reflete o payload na resposta de erro',
            async (payload) => {
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: payload, password: payload });

                expect(response.status).toBe(401);
                const body = JSON.stringify(response.body);
                expect(body).not.toContain(payload);
                expect(body).not.toMatch(/<script|onerror=|onload=|javascript:/i);
            },
        );

        it('nome com payload XSS é armazenado como texto (o escape é responsabilidade da renderização)', async () => {
            const payload = '<script>alert("XSS")</script>';
            await request(app.getHttpServer()).post('/user').send({
                name: payload,
                email,
                password: STRONG_PASSWORD,
                acceptedTerms: true,
            });
            const user = await userRepository.getByEmail(email);
            if (user.isFailure()) throw user.error;

            // Texto literal, sem ser "meio sanitizado" (ex.: tag removida mas
            // atributo mantido), o que poderia gerar um bypass na renderização.
            expect(user.value.name).toBe(formatPersonName(payload));
        });

        it('respostas da API (sucesso, erro e 404) são sempre application/json, nunca text/html', async () => {
            const { attacker } = await seedVictimAndAttacker(app, 'xss-ct');

            const responses = await Promise.all([
                request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: XSS_PAYLOADS[0], password: 'x' }),
                request(app.getHttpServer())
                    .get('/history')
                    .query({ crop: XSS_PAYLOADS[0] })
                    .set('Cookie', attacker.cookie),
                request(app.getHttpServer())
                    .get(`/history/${encodeURIComponent(XSS_PAYLOADS[1])}`)
                    .set('Cookie', attacker.cookie),
                request(app.getHttpServer()).get(
                    `/rota-inexistente/${encodeURIComponent(XSS_PAYLOADS[0])}`,
                ),
            ]);

            for (const response of responses) {
                const contentType = response.headers['content-type'] ?? '';
                expect(contentType).toContain('application/json');
                expect(contentType).not.toContain('text/html');
            }
        });
    });

    describe('Upload malicioso (/predict)', () => {
        const uploadsDir = path.resolve(
            __dirname,
            '..',
            '..',
            'src',
            'modules',
            'core',
            'infra',
            'uploads',
        );

        it.each([
            'shell.php',
            'payload.html',
            'script.js',
            'imagem.jpg.exe',
            'imagem.svg',
        ])('recusa upload de arquivo com extensão perigosa (%s)', async (filename) => {
            const { attacker } = await seedVictimAndAttacker(app, 'upload-ext');

            const response = await request(app.getHttpServer())
                .post('/predict')
                .set('Cookie', attacker.cookie)
                .field('crop', 'SOYBEAN')
                .attach('image', Buffer.from('<?php system($_GET["c"]); ?>'), {
                    filename,
                    contentType: 'image/jpeg',
                });

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).not.toBe(201);
        });

        it('nome de arquivo com path traversal não grava fora da pasta de uploads', async () => {
            const { attacker } = await seedVictimAndAttacker(app, 'upload-traversal');
            const escapedTarget = path.resolve(uploadsDir, '..', '..', 'pwned.jpg');

            await request(app.getHttpServer())
                .post('/predict')
                .set('Cookie', attacker.cookie)
                .field('crop', 'SOYBEAN')
                .attach('image', Buffer.from('fake'), {
                    filename: '../../pwned.jpg',
                    contentType: 'image/jpeg',
                });

            expect(fs.existsSync(escapedTarget)).toBe(false);
        });

        it('upload sem sessão é recusado antes de gravar qualquer arquivo', async () => {
            const response = await request(app.getHttpServer())
                .post('/predict')
                .field('crop', 'SOYBEAN')
                .attach('image', Buffer.from('fake'), {
                    filename: 'leaf.jpg',
                    contentType: 'image/jpeg',
                });

            expect(response.status).toBe(401);
        });
    });
});
