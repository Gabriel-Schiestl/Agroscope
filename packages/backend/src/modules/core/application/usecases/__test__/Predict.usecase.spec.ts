import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Crop } from '../../../domain/models/Crop';
import { Limit } from '../../../domain/models/Limit';
import { Plan } from '../../../domain/models/Plan';
import { Sickness } from '../../../domain/models/Sickness';
import { User } from '../../../domain/models/User';
import { HistoryRepository } from '../../../domain/repositories/History.repository';
import { SicknessRepository } from '../../../domain/repositories/Sickness.repository';
import { PlanRepository } from '../../../domain/repositories/Plan.repository';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { PredictService } from '../../../domain/services/Predict.service';
import { WeatherService } from '../../../domain/services/Weather.service';
import { ProducerService } from 'src/shared/domain/services/Producer.service';
import { PredictUseCase } from '../Predict.usecase';

describe('PredictUseCase', () => {
    const buildUser = (imageRequests = 0) =>
        User.load(
            {
                name: 'Gabriel',
                email: 'gabriel@example.com',
                limit: Limit.load({ imageRequests, chatRequests: 0 }, 'limit-1'),
                planId: 'plan-1',
            },
            'user-1',
        );

    const buildPlan = () => {
        const result = Plan.create({
            type: 'FREE',
            imageLimit: 10,
            chatLimit: 20,
            features: [],
            featureFlags: [],
            price: 0,
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    const buildSickness = () =>
        Sickness.load(
            {
                name: 'Requeima',
                symptoms: ['manchas'],
                climateConditions: {
                    temperatureMin: 15,
                    temperatureMax: 24,
                },
            },
            'sickness-1',
        );

    let sicknessRepository: jest.Mocked<SicknessRepository>;
    let historyRepository: jest.Mocked<HistoryRepository>;
    let planRepository: jest.Mocked<PlanRepository>;
    let userRepository: jest.Mocked<UserRepository>;
    let predictService: jest.Mocked<PredictService>;
    let producerService: jest.Mocked<ProducerService>;
    let weatherService: jest.Mocked<WeatherService>;
    let useCase: PredictUseCase;

    beforeEach(() => {
        sicknessRepository = {
            getSickness: jest.fn(),
            getSicknessByName: jest
                .fn()
                .mockResolvedValue(Res.success(buildSickness())),
            save: jest.fn(),
        };
        historyRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getAll: jest.fn(),
            getById: jest.fn(),
            getByUserId: jest.fn(),
            getAnalyticsByUserId: jest.fn(),
        };
        planRepository = {
            getById: jest.fn().mockResolvedValue(Res.success(buildPlan())),
            getByType: jest.fn(),
            getAll: jest.fn(),
        };
        userRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getAll: jest.fn(),
            getById: jest.fn().mockResolvedValue(Res.success(buildUser())),
            getByEmail: jest.fn(),
            resetAllLimits: jest.fn(),
        };
        predictService = {
            predict: jest.fn().mockResolvedValue(
                Res.success({
                    prediction: 'Requeima',
                    predictionConfidence: 0.9,
                }),
            ),
            getImageBase64: jest
                .fn()
                .mockResolvedValue(Res.success('base64-image')),
            getHandling: jest.fn().mockResolvedValue(
                Res.success({
                    diagnostico: 'diag',
                    explicacao: 'exp',
                    causas: 'causas',
                    manejo: 'manejo',
                    precautions: 'precautions',
                }),
            ),
        };
        producerService = {
            sendMessage: jest.fn(),
        };
        weatherService = {
            getRecentWeather: jest.fn(),
        };
        useCase = new PredictUseCase(
            sicknessRepository,
            historyRepository,
            planRepository,
            userRepository,
            predictService,
            producerService,
            weatherService,
        );
    });

    it('should fail when the user is not found', async () => {
        const error = new RepositoryNoDataFound('not found');
        userRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'unknown',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when the user has no active plan', async () => {
        userRepository.getById.mockResolvedValue(
            Res.success(
                User.load(
                    {
                        name: 'Gabriel',
                        email: 'gabriel@example.com',
                        limit: Limit.create(),
                    },
                    'user-1',
                ),
            ),
        );

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail when the plan is not found', async () => {
        planRepository.getById.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail when the image request limit has been reached', async () => {
        userRepository.getById.mockResolvedValue(
            Res.success(buildUser(10)),
        );

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(
            result.isFailure() && (result.error as BusinessException).message,
        ).toContain('Limite de 10 análises');
        expect(predictService.predict).not.toHaveBeenCalled();
    });

    it('should allow analysis for tomato now that its model is available', async () => {
        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.TOMATO,
        });

        expect(result.isSuccess()).toBe(true);
        expect(predictService.predict).toHaveBeenCalledWith(
            '/tmp/image.jpg',
            Crop.TOMATO,
        );
    });

    it('should forward the user-selected crop to the prediction and handling services', async () => {
        await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.WHEAT,
        });

        expect(predictService.predict).toHaveBeenCalledWith(
            '/tmp/image.jpg',
            Crop.WHEAT,
        );
        expect(predictService.getHandling).toHaveBeenCalledWith(
            'Requeima',
            Crop.WHEAT,
        );
        const savedHistory = historyRepository.save.mock.calls[0][0];
        expect(savedHistory.crop).toBe(Crop.WHEAT);
    });

    it('should fail when the prediction service fails', async () => {
        const error = new TechnicalException('predict error');
        predictService.predict.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when prediction confidence is below the minimum threshold', async () => {
        predictService.predict.mockResolvedValue(
            Res.success({
                prediction: 'Requeima',
                predictionConfidence: 0.5,
            }),
        );

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
    });

    it('should fail when fetching the image base64 fails', async () => {
        const error = new TechnicalException('image error');
        predictService.getImageBase64.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            imagePath: '/tmp/image.jpg',
            userId: 'user-1',
            crop: Crop.SOYBEAN,
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    describe('healthy plant flow', () => {
        beforeEach(() => {
            predictService.predict.mockResolvedValue(
                Res.success({
                    prediction: 'TOMATO___HEALTHY',
                    predictionConfidence: 0.95,
                }),
            );
        });

        it('should save a healthy history, increment usage, and publish the image', async () => {
            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isSuccess()).toBe(true);
            expect(historyRepository.save).toHaveBeenCalled();
            expect(userRepository.save).toHaveBeenCalled();
            const savedUser = userRepository.save.mock.calls[0][0] as User;
            expect(savedUser.limit.imageRequests).toBe(1);
            expect(producerService.sendMessage).toHaveBeenCalledWith('image', {
                prediction: 'saudavel',
                image: 'base64-image',
            });
            expect(sicknessRepository.getSicknessByName).not.toHaveBeenCalled();
        });

        it('should fail when saving the healthy history fails', async () => {
            const error = new TechnicalException('save error');
            historyRepository.save.mockResolvedValue(Res.failure(error));

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });
    });

    describe('disease flow', () => {
        it('should fail when fetching the handling fails', async () => {
            const error = new TechnicalException('handling error');
            predictService.getHandling.mockResolvedValue(Res.failure(error));

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });

        it('should fail when the sickness cannot be found', async () => {
            const error = new RepositoryNoDataFound('not found');
            sicknessRepository.getSicknessByName.mockResolvedValue(
                Res.failure(error),
            );

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });

        it('should succeed without checking weather when no location is provided', async () => {
            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isSuccess()).toBe(true);
            expect(weatherService.getRecentWeather).not.toHaveBeenCalled();
        });

        it('should keep the diagnosis and flag it when the regional climate is incompatible', async () => {
            weatherService.getRecentWeather.mockResolvedValue(
                Res.success({ temperature: 35, humidity: 50, season: 'summer' }),
            );

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
                location: { latitude: -23.5512, longitude: -46.6339 },
            });

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.climateValidation).toEqual({
                latitude: -23.55,
                longitude: -46.63,
                temperature: 35,
                humidity: 50,
                season: 'summer',
                compatible: false,
                mismatches: ['temperature'],
            });
            const savedHistory = historyRepository.save.mock.calls[0][0];
            expect(savedHistory.climateValidation?.compatible).toBe(false);
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('should mark the diagnosis as compatible when the regional climate matches', async () => {
            weatherService.getRecentWeather.mockResolvedValue(
                Res.success({ temperature: 20, humidity: 50 }),
            );

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
                location: { latitude: -23.5, longitude: -46.6 },
            });

            expect(result.isSuccess()).toBe(true);
            expect(
                result.isSuccess() && result.value.climateValidation?.compatible,
            ).toBe(true);
            expect(weatherService.getRecentWeather).toHaveBeenCalledWith({
                latitude: -23.5,
                longitude: -46.6,
            });
        });

        it('should succeed without climate validation when the weather service fails', async () => {
            weatherService.getRecentWeather.mockResolvedValue(
                Res.failure(new TechnicalException('weather down')),
            );

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
                location: { latitude: -23.5, longitude: -46.6 },
            });

            expect(result.isSuccess()).toBe(true);
            expect(
                result.isSuccess() && result.value.climateValidation,
            ).toBeUndefined();
        });

        it('should not check the weather for a healthy plant', async () => {
            predictService.predict.mockResolvedValue(
                Res.success({
                    prediction: 'healthy',
                    predictionConfidence: 0.95,
                }),
            );

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
                location: { latitude: -23.5, longitude: -46.6 },
            });

            expect(result.isSuccess()).toBe(true);
            expect(weatherService.getRecentWeather).not.toHaveBeenCalled();
        });

        it('should save the history, increment usage, and publish the image on success', async () => {
            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.handling).toBe(
                'manejo',
            );
            const savedHistory = historyRepository.save.mock.calls[0][0];
            expect(savedHistory.sicknessId).toBe('sickness-1');

            const savedUser = userRepository.save.mock.calls[0][0] as User;
            expect(savedUser.limit.imageRequests).toBe(1);

            expect(producerService.sendMessage).toHaveBeenCalledWith('image', {
                prediction: 'Requeima',
                image: 'base64-image',
            });
        });

        it('should fail when saving the history fails', async () => {
            const error = new TechnicalException('save error');
            historyRepository.save.mockResolvedValue(Res.failure(error));

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });

        it('should fail when saving the user fails', async () => {
            const error = new TechnicalException('save error');
            userRepository.save.mockResolvedValue(Res.failure(error));

            const result = await useCase.execute({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                crop: Crop.SOYBEAN,
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });
    });
});
