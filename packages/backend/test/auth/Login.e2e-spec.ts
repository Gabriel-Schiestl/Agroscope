import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';

describe('Auth - login (e2e)', () => {
    let app: INestApplication;
    let authenticationRepository: AuthenticationRepository;

    const email = 'login.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();

        authenticationRepository = app.get('AuthenticationRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
        await seedUserWithAuthentication(app, { email, password });
    });

    it('retorna 200 e um cookie httpOnly quando as credenciais são válidas', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });

        expect(response.status).toBe(200);

        const cookies = response.headers['set-cookie'] as unknown as string[];
        const authCookie = cookies.find((cookie) =>
            cookie.startsWith('agroscope-authentication='),
        );
        expect(authCookie).toBeDefined();
        expect(authCookie).toContain('HttpOnly');
    });

    it('retorna 401 e incrementa as tentativas incorretas quando a senha é inválida', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: 'wrong-password' });

        expect(response.status).toBe(401);

        const authentication = await authenticationRepository.findByEmail(email);
        if (authentication.isFailure()) throw authentication.error;
        expect(authentication.value.incorrectPasswordAttempts).toBe(1);
    });

    it('bloqueia a conta após 5 tentativas incorretas, mesmo com a senha correta em seguida', async () => {
        for (let attempt = 0; attempt < 5; attempt++) {
            const failedResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email, password: 'wrong-password' });
            expect(failedResponse.status).toBe(401);
        }

        const blockedResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });

        expect(blockedResponse.status).toBe(401);

        const authentication = await authenticationRepository.findByEmail(email);
        if (authentication.isFailure()) throw authentication.error;
        expect(authentication.value.verifyAuthenticationBlocked()).toBe(true);
    });
});
