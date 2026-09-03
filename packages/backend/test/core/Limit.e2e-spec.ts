import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication, seedPlan } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';

describe('Core - limit (e2e)', () => {
    let app: INestApplication;

    const email = 'limit.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
    });

    it('retorna os limites de uso conforme o plano do usuário', async () => {
        const plan = await seedPlan(app, {
            type: 'INTEGRATION_LIMIT_PLAN',
            imageLimit: 7,
            chatLimit: 3,
            featureFlags: ['analytics'],
        });
        await seedUserWithAuthentication(app, {
            email,
            password,
            planId: plan.id,
        });
        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .get('/limit')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            imageRequests: 0,
            imageLimit: 7,
            chatRequests: 0,
            chatLimit: 3,
            featureFlags: ['analytics'],
        });
    });

    it('retorna 404 quando o usuário não tem plano ativo', async () => {
        await seedUserWithAuthentication(app, { email, password });
        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .get('/limit')
            .set('Cookie', cookie);

        expect(response.status).toBe(404);
    });

    it('recusa o acesso sem sessão válida', async () => {
        const response = await request(app.getHttpServer()).get('/limit');

        expect(response.status).toBe(401);
    });
});
