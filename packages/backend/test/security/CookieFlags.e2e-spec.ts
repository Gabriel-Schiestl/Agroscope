import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedPlan, seedUserWithAuthentication } from '../setup/seed';
import { STRONG_PASSWORD, findSetCookie } from './security-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Segurança — Flags do cookie de sessão
//
//   O cookie `agroscope-authentication` precisa sair do /auth/login com
//   HttpOnly (inacessível via JS, mitiga roubo por XSS), Secure (só trafega
//   em HTTPS) e SameSite=None (necessário pro front em domínio separado da
//   API — só é seguro combinado com Secure). O /auth/logout precisa expirar
//   esse mesmo cookie de verdade, não só devolver 200.
// ─────────────────────────────────────────────────────────────────────────────

describe('Segurança — Flags do cookie de sessão (e2e)', () => {
    let app: INestApplication;
    const emailProducer = { sendMessage: jest.fn() };
    const email = 'cookieflags.user@agroscope.test';

    beforeAll(async () => {
        app = await createTestApp([
            { token: 'EmailProducerService', value: emailProducer },
        ]);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['authentication', 'user']);
        const plan = await seedPlan(app, {
            type: 'cookie-flags-free',
            chatLimit: 50,
        });
        await seedUserWithAuthentication(app, {
            name: 'Cookie Flags User',
            email,
            password: STRONG_PASSWORD,
            planId: plan.id,
        });
    });

    it('login seta o cookie de sessão com HttpOnly, Secure e SameSite=None', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: STRONG_PASSWORD });

        const setCookie = findSetCookie(response);

        expect(setCookie).toBeDefined();
        const flags = setCookie!.toLowerCase();
        expect(flags).toContain('httponly');
        expect(flags).toContain('secure');
        expect(flags).toContain('samesite=none');
    });

    it('logout expira o cookie de sessão (não só confirma 200)', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: STRONG_PASSWORD });
        const cookie = findSetCookie(loginResponse)!.split(';')[0];

        const logoutResponse = await request(app.getHttpServer())
            .post('/auth/logout')
            .set('Cookie', cookie);

        expect(logoutResponse.status).toBe(200);

        const clearedCookie = findSetCookie(logoutResponse);
        expect(clearedCookie).toBeDefined();
        // clearCookie seta Expires no passado (ou Max-Age=0) pra forçar o
        // browser a descartar o cookie imediatamente.
        expect(clearedCookie!.toLowerCase()).toMatch(
            /max-age=0|expires=thu, 01 jan 1970/,
        );
    });
});
