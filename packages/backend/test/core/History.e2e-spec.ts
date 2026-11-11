import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedPlan, seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { History } from 'src/modules/core/domain/models/History';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';

describe('Core - history (e2e)', () => {
    let app: INestApplication;
    let historyRepository: HistoryRepository;

    const ownerEmail = 'history.owner@agroscope.test';
    const otherEmail = 'history.other@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();

        historyRepository = app.get('HistoryRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['history', 'authentication', 'user']);
    });

    it('lista apenas o histórico do usuário autenticado', async () => {
        const { user: owner } = await seedUserWithAuthentication(app, {
            email: ownerEmail,
            password,
        });
        const { user: other } = await seedUserWithAuthentication(app, {
            email: otherEmail,
            password,
        });

        await historyRepository.save(
            History.create({
                crop: 'Soja',
                cropConfidence: 0.92,
                image: 'soja.jpg',
                causes: 'Excesso de umidade',
                userId: owner.id,
            }),
        );
        await historyRepository.save(
            History.create({
                crop: 'Milho',
                cropConfidence: 0.81,
                image: 'milho.jpg',
                causes: 'Deficiência de nutrientes',
                userId: other.id,
            }),
        );

        const cookie = await loginAndGetCookie(app, ownerEmail, password);

        const response = await request(app.getHttpServer())
            .get('/history')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].crop).toBe('Soja');
    });

    it('retorna 404 ao buscar por id um histórico de outro usuário', async () => {
        const { user: owner } = await seedUserWithAuthentication(app, {
            email: ownerEmail,
            password,
        });
        const { user: other } = await seedUserWithAuthentication(app, {
            email: otherEmail,
            password,
        });

        const otherHistory = History.create({
            crop: 'Milho',
            cropConfidence: 0.81,
            image: 'milho.jpg',
            causes: 'Deficiência de nutrientes',
            userId: other.id,
        });
        await historyRepository.save(otherHistory);

        const cookie = await loginAndGetCookie(app, ownerEmail, password);

        const response = await request(app.getHttpServer())
            .get(`/history/${otherHistory.id}`)
            .set('Cookie', cookie);

        expect(response.status).toBe(404);
    });

    describe('armazenamento por plano (RF05)', () => {
        const saveTwoAnalyses = async (userId: string) => {
            const older = History.create({
                crop: 'Soja',
                cropConfidence: 0.9,
                image: 'antiga.jpg',
                causes: 'N/A',
                userId,
            });
            await historyRepository.save(older);
            await new Promise((resolve) => setTimeout(resolve, 20));
            const newer = History.create({
                crop: 'Milho',
                cropConfidence: 0.9,
                image: 'nova.jpg',
                causes: 'N/A',
                userId,
            });
            await historyRepository.save(newer);
            return { older, newer };
        };

        it('plano padrão vê apenas a análise mais recente; a anterior fica oculta', async () => {
            const plan = await seedPlan(app, { type: 'HISTORY_FREE_TEST' });
            const { user } = await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });
            const { older, newer } = await saveTwoAnalyses(user.id);
            const cookie = await loginAndGetCookie(app, ownerEmail, password);

            const list = await request(app.getHttpServer())
                .get('/history')
                .set('Cookie', cookie);
            expect(list.status).toBe(200);
            expect(list.body.map((h: { id: string }) => h.id)).toEqual([
                newer.id,
            ]);

            const hidden = await request(app.getHttpServer())
                .get(`/history/${older.id}`)
                .set('Cookie', cookie);
            expect(hidden.status).toBe(404);

            expect(
                (await historyRepository.getById(older.id)).isSuccess(),
            ).toBe(true);
        });

        it('plano com histórico completo vê todas as análises', async () => {
            const plan = await seedPlan(app, {
                type: 'HISTORY_FULL_TEST',
                featureFlags: ['FULL_HISTORY'],
            });
            const { user } = await seedUserWithAuthentication(app, {
                email: ownerEmail,
                password,
                planId: plan.id,
            });
            await saveTwoAnalyses(user.id);
            const cookie = await loginAndGetCookie(app, ownerEmail, password);

            const list = await request(app.getHttpServer())
                .get('/history')
                .set('Cookie', cookie);
            expect(list.body).toHaveLength(2);
        });
    });

    it('recusa o acesso ao histórico sem sessão válida', async () => {
        const response = await request(app.getHttpServer()).get('/history');

        expect(response.status).toBe(401);
    });
});
