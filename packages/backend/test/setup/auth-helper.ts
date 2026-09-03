import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function loginAndGetCookie(
    app: INestApplication,
    email: string,
    password: string,
): Promise<string> {
    const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const authCookie = cookies.find((cookie) =>
        cookie.startsWith('agroscope-authentication='),
    );

    if (!authCookie) {
        throw new Error(
            `Login failed while preparing test session: ${JSON.stringify(response.body)}`,
        );
    }

    return authCookie.split(';')[0];
}
