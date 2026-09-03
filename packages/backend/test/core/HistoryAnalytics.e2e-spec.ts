import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { History } from 'src/modules/core/domain/models/History';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';

// Seeded by the `SeedMockSicknesses` migration.
const REQUEIMA_SICKNESS_ID = '00000000-0000-0000-0000-000000000101';

describe('Core - history analytics (e2e)', () => {
    let app: INestApplication;
    let historyRepository: HistoryRepository;

    const email = 'history.analytics.integration@agroscope.test';
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

    it('agrega o histórico do usuário por doença, cultura e período', async () => {
        const { user } = await seedUserWithAuthentication(app, {
            email,
            password,
        });

        await historyRepository.save(
            History.create({
                crop: 'Soja',
                cropConfidence: 0.95,
                image: 'saudavel-1.jpg',
                causes: 'N/A',
                userId: user.id,
            }),
        );
        await historyRepository.save(
            History.create({
                crop: 'Soja',
                cropConfidence: 0.93,
                image: 'saudavel-2.jpg',
                causes: 'N/A',
                userId: user.id,
            }),
        );
        await historyRepository.save(
            History.create({
                crop: 'Milho',
                cropConfidence: 0.88,
                sicknessId: REQUEIMA_SICKNESS_ID,
                sicknessConfidence: 0.9,
                image: 'doente-1.jpg',
                causes: 'Excesso de umidade',
                userId: user.id,
            }),
        );

        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .get('/history/analytics')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body.totalAnalyses).toBe(3);
        expect(response.body.healthyCount).toBe(2);
        expect(response.body.diseasedCount).toBe(1);
        expect(response.body.distinctCropsCount).toBe(2);

        expect(response.body.byDisease).toEqual([
            expect.objectContaining({
                sicknessId: REQUEIMA_SICKNESS_ID,
                sicknessName: 'Requeima',
                count: 1,
            }),
        ]);
        expect(response.body.byCrop).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ crop: 'Soja', count: 2 }),
                expect.objectContaining({ crop: 'Milho', count: 1 }),
            ]),
        );
    });

    it('retorna um payload zerado quando o usuário não tem histórico', async () => {
        await seedUserWithAuthentication(app, { email, password });
        const cookie = await loginAndGetCookie(app, email, password);

        const response = await request(app.getHttpServer())
            .get('/history/analytics')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body.totalAnalyses).toBe(0);
        expect(response.body.byDisease).toEqual([]);
        expect(response.body.byCrop).toEqual([]);
        expect(response.body.peakPeriod).toBeNull();
    });
});
