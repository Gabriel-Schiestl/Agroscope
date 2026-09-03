import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { Plan } from 'src/modules/core/domain/models/Plan';

describe('Core - plans (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('lista os planos seedados pelas migrations, sem exigir sessão', async () => {
        const response = await request(app.getHttpServer()).get('/plan');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const freePlan = response.body.find(
            (plan: { type: string }) => plan.type === Plan.FREE_TYPE,
        );
        expect(freePlan).toBeDefined();
        expect(typeof freePlan.imageLimit).toBe('number');
    });
});
