import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './setup/test-app';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/hello (GET)', () => {
        return request(app.getHttpServer())
            .get('/hello')
            .expect(200)
            .expect(JSON.stringify('Hello World!'));
    });
});
