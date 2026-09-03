import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { ProducerService } from 'src/shared/domain/services/Producer.service';

describe('Auth - password recovery (e2e)', () => {
    let app: INestApplication;
    let authenticationRepository: AuthenticationRepository;
    let emailProducer: { sendMessage: jest.Mock };

    const email = 'recovery.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        emailProducer = { sendMessage: jest.fn() };

        app = await createTestApp([
            { token: 'EmailProducerService', value: emailProducer },
        ]);

        authenticationRepository = app.get('AuthenticationRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        emailProducer.sendMessage.mockClear();
        await clearTables(app, ['authentication', 'user']);
        await seedUserWithAuthentication(app, { email, password });
    });

    async function requestRecoveryToken(): Promise<string> {
        const response = await request(app.getHttpServer())
            .post('/auth/recovery-token')
            .send({ email });
        expect(response.status).toBe(200);

        const authentication = await authenticationRepository.findByEmail(email);
        if (authentication.isFailure()) throw authentication.error;

        return authentication.value.recoveryCode;
    }

    it('gera um token de 6 dígitos, persiste no banco e não envia a senha por e-mail', async () => {
        const token = await requestRecoveryToken();

        expect(token).toMatch(/^\d{6}$/);
        expect(emailProducer.sendMessage).toHaveBeenCalledWith(
            'token',
            expect.objectContaining({ to: email, params: { name: expect.any(String), token } }),
        );
    });

    it('valida o token correto e recusa um token incorreto', async () => {
        const token = await requestRecoveryToken();

        const invalidAttempt = await request(app.getHttpServer())
            .post('/auth/validate-recovery-token')
            .send({ email, token: '000000' });
        expect(invalidAttempt.status).toBe(400);

        const validAttempt = await request(app.getHttpServer())
            .post('/auth/validate-recovery-token')
            .send({ email, token });
        expect(validAttempt.status).toBe(200);
    });

    it('troca a senha com o token correto e a nova senha passa a funcionar no login', async () => {
        const token = await requestRecoveryToken();
        const newPassword = 'N3w-Str0ng-Password!';

        const changeResponse = await request(app.getHttpServer())
            .post('/auth/change-password')
            .send({ email, token, newPassword });
        expect(changeResponse.status).toBe(200);

        const oldPasswordLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });
        expect(oldPasswordLogin.status).toBe(401);

        const newPasswordLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: newPassword });
        expect(newPasswordLogin.status).toBe(200);
    });

    it('recusa a troca de senha com um token incorreto e mantém a senha antiga', async () => {
        await requestRecoveryToken();

        const changeResponse = await request(app.getHttpServer())
            .post('/auth/change-password')
            .send({ email, token: '000000', newPassword: 'Another-Str0ng1!' });
        expect(changeResponse.status).toBe(400);

        const stillWorksWithOldPassword = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });
        expect(stillWorksWithOldPassword.status).toBe(200);
    });
});
