import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { waitFor } from '../setup/wait-for';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { EncryptionService } from 'src/modules/auth/domain/services/Encryption.service';

describe('User - creation (e2e)', () => {
    let app: INestApplication;
    let userRepository: UserRepository;
    let authenticationRepository: AuthenticationRepository;
    let encryptionService: EncryptionService;

    const email = 'create.user.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();

        userRepository = app.get('UserRepository');
        authenticationRepository = app.get('AuthenticationRepository');
        encryptionService = app.get('EncryptionService');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
    });

    it('cria o usuário e, de forma assíncrona, a credencial correspondente no AuthModule', async () => {
        const response = await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Create User Integration',
                email,
                password,
                acceptedTerms: true,
            });

        expect(response.status).toBe(201);

        const user = await userRepository.getByEmail(email);
        if (user.isFailure()) throw user.error;
        expect(user.value.name).toBe('Create User Integration');
        expect(user.value.planId).toBeDefined();

        const authentication = await waitFor(async () => {
            const result = await authenticationRepository.findByEmail(email);
            return result.isSuccess() ? result.value : undefined;
        });

        const passwordMatches = await encryptionService.compare(
            password,
            authentication.password,
        );
        expect(passwordMatches.isSuccess()).toBe(true);
    });

    it('recusa a criação de um usuário com e-mail já cadastrado', async () => {
        const payload = {
            name: 'Duplicated User',
            email,
            password,
            acceptedTerms: true,
        };

        const first = await request(app.getHttpServer())
            .post('/user')
            .send(payload);
        expect(first.status).toBe(201);

        const second = await request(app.getHttpServer())
            .post('/user')
            .send(payload);
        expect(second.status).toBe(400);
    });

    it('recusa a criação sem aceitar os termos de uso', async () => {
        const response = await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'No Terms User',
                email: 'no.terms@agroscope.test',
                password,
                acceptedTerms: false,
            });

        expect(response.status).toBe(400);

        const user = await userRepository.getByEmail('no.terms@agroscope.test');
        expect(user.isFailure()).toBe(true);
    });
});
