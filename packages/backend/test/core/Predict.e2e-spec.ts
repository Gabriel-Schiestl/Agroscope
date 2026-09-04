import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication, seedPlan } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';
import {
    PredictService,
    PredictServiceResponse,
    HandlingServiceResponse,
} from 'src/modules/core/domain/services/Predict.service';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

// Seeded by the `SeedRealSicknesses` migration.
const TARGET_SPOT_SICKNESS_ID = '11111111-0000-0000-0000-000000000006';
const TARGET_SPOT_SICKNESS_NAME = 'Target_Spot';

const FAKE_IMAGE_BASE64 = 'ZmFrZS1pbWFnZS1jb250ZW50';

class FakePredictService implements PredictService {
    predictResponse: PredictServiceResponse = {
        plant: 'tomate',
        plantConfidence: 0.95,
        prediction: 'Healthy',
        predictionConfidence: 0.97,
    };
    handlingResponse: HandlingServiceResponse = {
        diagnostico: 'Planta saudável',
        explicacao: 'Sem sinais de doença',
        causas: 'N/A',
        manejo: 'Nenhuma ação necessária',
    };

    async predict(): Promise<Result<TechnicalException, PredictServiceResponse>> {
        return Res.success(this.predictResponse);
    }

    async getImageBase64(): Promise<Result<TechnicalException, string>> {
        return Res.success(FAKE_IMAGE_BASE64);
    }

    async getHandling(): Promise<Result<TechnicalException, HandlingServiceResponse>> {
        return Res.success(this.handlingResponse);
    }
}

describe('Core - predict (e2e)', () => {
    let app: INestApplication;
    let userRepository: UserRepository;
    let historyRepository: HistoryRepository;
    let fakePredictService: FakePredictService;
    let producerService: { sendMessage: jest.Mock };

    const email = 'predict.integration@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        fakePredictService = new FakePredictService();
        producerService = { sendMessage: jest.fn() };

        app = await createTestApp([
            { token: 'PredictService', value: fakePredictService },
            { token: 'ProducerService', value: producerService },
        ]);

        userRepository = app.get('UserRepository');
        historyRepository = app.get('HistoryRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        producerService.sendMessage.mockClear();
        fakePredictService.predictResponse = {
            plant: 'tomate',
            plantConfidence: 0.95,
            prediction: 'Healthy',
            predictionConfidence: 0.97,
        };
        await clearTables(app, ['history', 'authentication', 'user']);
    });

    async function seedUserWithPlan(imageLimit: number) {
        const plan = await seedPlan(app, {
            type: 'INTEGRATION_PREDICT_PLAN',
            imageLimit,
        });
        const { user } = await seedUserWithAuthentication(app, {
            email,
            password,
            planId: plan.id,
        });
        const cookie = await loginAndGetCookie(app, email, password);
        return { user, cookie };
    }

    it('cria um histórico "saudável" e envia a imagem para a fila quando a planta está saudável', async () => {
        const { user, cookie } = await seedUserWithPlan(5);

        const response = await request(app.getHttpServer())
            .post('/predict')
            .set('Cookie', cookie)
            .attach('image', Buffer.from('fake-jpg-bytes'), 'leaf.jpg');

        expect(response.status).toBe(201);
        expect(response.body.crop).toBe('tomate');
        expect(response.body.sicknessId).toBeNull();
        expect(response.body.handling).toBe('Nenhuma ação necessária');

        const updatedUser = await userRepository.getById(user.id);
        if (updatedUser.isFailure()) throw updatedUser.error;
        expect(updatedUser.value.limit.imageRequests).toBe(1);

        expect(producerService.sendMessage).toHaveBeenCalledWith('image', {
            prediction: 'saudavel',
            image: FAKE_IMAGE_BASE64,
        });
    });

    it('cria um histórico com a doença identificada, vinculando a doença cadastrada', async () => {
        const { user, cookie } = await seedUserWithPlan(5);

        fakePredictService.predictResponse = {
            plant: 'tomate',
            plantConfidence: 0.93,
            prediction: TARGET_SPOT_SICKNESS_NAME,
            predictionConfidence: 0.9,
        };
        fakePredictService.handlingResponse = {
            diagnostico: 'Requeima identificada',
            explicacao: 'Fungo Phytophthora infestans',
            causas: 'Excesso de umidade',
            manejo: 'Aplicar fungicida',
            precautions: 'Evitar molhar as folhas',
        };

        const response = await request(app.getHttpServer())
            .post('/predict')
            .set('Cookie', cookie)
            .attach('image', Buffer.from('fake-jpg-bytes'), 'leaf.jpg');

        expect(response.status).toBe(201);
        expect(response.body.sicknessId).toBe(TARGET_SPOT_SICKNESS_ID);
        expect(response.body.crop).toBe('tomate');
        expect(response.body.handling).toBe('Aplicar fungicida');
        expect(response.body.causes).toBe('Excesso de umidade');

        const histories = await historyRepository.getByUserId(user.id);
        if (histories.isFailure()) throw histories.error;
        expect(histories.value).toHaveLength(1);
        expect(histories.value[0].sicknessId).toBe(TARGET_SPOT_SICKNESS_ID);
    });

    it('recusa a análise quando a confiança da predição é baixa e não cria histórico', async () => {
        const { user, cookie } = await seedUserWithPlan(5);

        fakePredictService.predictResponse = {
            plant: 'tomate',
            plantConfidence: 0.4,
            prediction: 'saudavel',
            predictionConfidence: 0.4,
        };

        const response = await request(app.getHttpServer())
            .post('/predict')
            .set('Cookie', cookie)
            .attach('image', Buffer.from('fake-jpg-bytes'), 'leaf.jpg');

        expect(response.status).toBe(400);

        const histories = await historyRepository.getByUserId(user.id);
        if (histories.isFailure()) throw histories.error;
        expect(histories.value).toHaveLength(0);
        expect(producerService.sendMessage).not.toHaveBeenCalled();
    });

    it('recusa a análise quando o limite de imagens do plano foi atingido', async () => {
        const { cookie } = await seedUserWithPlan(1);

        const first = await request(app.getHttpServer())
            .post('/predict')
            .set('Cookie', cookie)
            .attach('image', Buffer.from('fake-jpg-bytes'), 'leaf.jpg');
        expect(first.status).toBe(201);

        const second = await request(app.getHttpServer())
            .post('/predict')
            .set('Cookie', cookie)
            .attach('image', Buffer.from('fake-jpg-bytes'), 'leaf.jpg');
        expect(second.status).toBe(400);
    });
});
