import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication, seedPlan } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';

describe('User - change plan (e2e)', () => {
    let app: INestApplication;
    let userRepository: UserRepository;

    const email = 'change.plan.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();

        userRepository = app.get('UserRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
    });

    it('troca o plano do usuário autenticado', async () => {
        const initialPlan = await seedPlan(app, { type: 'INTEGRATION_INITIAL' });
        const targetPlan = await seedPlan(app, { type: 'INTEGRATION_TARGET' });
        const { user } = await seedUserWithAuthentication(app, {
            email,
            password,
            planId: initialPlan.id,
        });
        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .patch('/user/plan')
            .set('Cookie', cookie)
            .send({ planId: targetPlan.id });

        expect(response.status).toBe(200);

        const updatedUser = await userRepository.getById(user.id);
        if (updatedUser.isFailure()) throw updatedUser.error;
        expect(updatedUser.value.planId).toBe(targetPlan.id);
    });

    it('recusa a troca para um plano inexistente', async () => {
        const initialPlan = await seedPlan(app, { type: 'INTEGRATION_INITIAL' });
        const { user } = await seedUserWithAuthentication(app, {
            email,
            password,
            planId: initialPlan.id,
        });
        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .patch('/user/plan')
            .set('Cookie', cookie)
            .send({ planId: '00000000-0000-0000-0000-000000000000' });

        expect(response.status).toBe(400);

        const unchangedUser = await userRepository.getById(user.id);
        if (unchangedUser.isFailure()) throw unchangedUser.error;
        expect(unchangedUser.value.planId).toBe(initialPlan.id);
    });

    it('recusa a troca sem sessão válida', async () => {
        const response = await request(app.getHttpServer())
            .patch('/user/plan')
            .send({ planId: '00000000-0000-0000-0000-000000000000' });

        expect(response.status).toBe(401);
    });
});
