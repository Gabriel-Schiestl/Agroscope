import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';

describe('Auth - session (e2e)', () => {
    let app: INestApplication;

    const email = 'session.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
        await seedUserWithAuthentication(app, { email, password, name: 'Session User' });
    });

    describe('GET /auth/validate', () => {
        it('recusa a requisição sem cookie de sessão', async () => {
            const response = await request(app.getHttpServer()).get(
                '/auth/validate',
            );

            expect(response.status).toBe(401);
        });

        it('recusa a requisição com um cookie inválido', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', 'agroscope-authentication=not-a-valid-token');

            expect(response.status).toBe(401);
        });

        it('retorna os dados do usuário autenticado quando o cookie é válido', async () => {
            const cookie = await loginAndGetCookie(app, email, password);

            const response = await request(app.getHttpServer())
                .get('/auth/validate')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(email);
            expect(response.body.name).toBe('Session User');
        });
    });

    describe('POST /auth/logout', () => {
        it('limpa o cookie de sessão', async () => {
            const cookie = await loginAndGetCookie(app, email, password);

            const response = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });

            const clearedCookie = (
                response.headers['set-cookie'] as unknown as string[]
            ).find((c) => c.startsWith('agroscope-authentication='));
            expect(clearedCookie).toMatch(/^agroscope-authentication=;/);
        });
    });
});
