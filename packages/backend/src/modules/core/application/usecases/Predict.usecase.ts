import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';
import { PlanRepository } from '../../domain/repositories/Plan.repository';
import { UserRepository } from '../../domain/repositories/User.repository';
import { PredictService } from '../../domain/services/Predict.service';
import {
    UserLocation,
    WeatherService,
} from '../../domain/services/Weather.service';

import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { HistoryDto } from '../dto/History.dto';
import { HistoryAppMapper } from '../mappers/History.mapper';
import { ProducerService } from 'src/shared/domain/services/Producer.service';

export interface PredictParams {
    imagePath: string;
    userId: string;
    location?: UserLocation;
}

@Injectable()
export class PredictUseCase extends AbstractUseCase<
    PredictParams,
    Exception,
    HistoryDto
> {
    constructor(
        @Inject('SicknessRepository')
        private readonly sicknessRepository: SicknessRepository,
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('PredictService')
        private readonly predictService: PredictService,
        @Inject('ProducerService')
        private readonly producerService: ProducerService,
        @Inject('WeatherService')
        private readonly weatherService: WeatherService,
    ) {
        super();
    }

    async onExecute({
        imagePath,
        userId,
        location,
    }: PredictParams): Promise<Result<Exception, HistoryDto>> {
        const userResult = await this.userRepository.getById(userId);
        if (userResult.isFailure()) {
            return Res.failure(userResult.error);
        }

        const user = userResult.value;

        if (!user.planId) {
            return Res.failure(
                new BusinessException('Usuário sem plano ativo'),
            );
        }

        const planResult = await this.planRepository.getById(user.planId);
        if (planResult.isFailure()) {
            return Res.failure(new BusinessException('Plano não encontrado'));
        }

        const plan = planResult.value;

        if (user.limit.imageRequests >= plan.imageLimit) {
            return Res.failure(
                new BusinessException(
                    `Limite de ${plan.imageLimit} análises de imagens atingido`,
                ),
            );
        }

        const result = await this.predictService.predict(imagePath);
        if (result.isFailure()) {
            console.error('Falha na predição:', result.error);
            return Res.failure(result.error);
        }

        const MIN_CONFIDENCE = 0.8;
        const { plantConfidence, predictionConfidence } = result.value;

        if (
            plantConfidence < MIN_CONFIDENCE ||
            predictionConfidence < MIN_CONFIDENCE
        ) {
            return Res.failure(
                new BusinessException(
                    'Não foi possível identificar a planta ou doença com confiança suficiente. Por favor, envie uma imagem mais nítida, bem iluminada e focada na folha.',
                ),
            );
        }

        const imageBase64 = await this.predictService.getImageBase64(imagePath);
        if (imageBase64.isFailure()) return Res.failure(imageBase64.error);

        if (result.value.prediction.includes('saudavel')) {
            const history = History.create({
                image: imageBase64.value,
                userId: userId,
                handling: 'Nenhuma ação necessária',
                crop: null,
                sicknessId: null,
                cropConfidence: null,
            });

            const saveResult = await this.historyRepository.save(history);
            if (saveResult.isFailure()) return Res.failure(saveResult.error);

            user.limit.incrementImageRequests();
            user.limit.setLastAnalysis(new Date());

            const saveUserResult = await this.userRepository.save(user);
            if (saveUserResult.isFailure())
                return Res.failure(saveUserResult.error);

            this.sendImage('saudavel', imageBase64.value);

            return Res.success(HistoryAppMapper.toDto(history));
        }

        const handling = await this.predictService.getHandling(
            result.value.prediction,
            result.value.plant,
        );
        if (handling.isFailure()) {
            return Res.failure(handling.error);
        }

        const sicknessResult = await this.sicknessRepository.getSicknessByName(
            result.value.prediction,
        );

        if (sicknessResult.isFailure()) {
            return Res.failure(sicknessResult.error);
        }

        const sickness = sicknessResult.value;

        if (location) {
            const weatherResult =
                await this.weatherService.getCurrentWeather(location);

            if (weatherResult.isSuccess()) {
                const compatible = sickness.isCompatibleWithWeather(
                    weatherResult.value,
                );

                if (!compatible) {
                    return Res.failure(
                        new BusinessException(
                            'Não foi possível confirmar o diagnóstico: as condições climáticas da sua região não correspondem ao padrão esperado para esta doença.',
                        ),
                    );
                }
            }
        }

        const history = History.create({
            handling: handling.value.manejo,
            image: imageBase64.value,
            sicknessId: sickness.id,
            userId: userId,
            crop: result.value.plant,
            cropConfidence: result.value.plantConfidence,
            explanation: handling.value.explicacao,
            sicknessConfidence: result.value.predictionConfidence,
            causes: handling.value.causas,
            precautions: handling.value.precautions,
        });

        const saveHistoryResult = await this.historyRepository.save(history);
        if (saveHistoryResult.isFailure())
            return Res.failure(saveHistoryResult.error);

        user.limit.incrementImageRequests();
        user.limit.setLastAnalysis(new Date());

        const saveUserResult = await this.userRepository.save(user);
        if (saveUserResult.isFailure())
            return Res.failure(saveUserResult.error);

        this.sendImage(result.value.prediction, imageBase64.value);

        return Res.success(HistoryAppMapper.toDto(history));
    }

    private async sendImage(prediction: string, image: string) {
        const payload = {
            prediction: prediction,
            image: image,
        };

        this.producerService.sendMessage('image', payload);
    }
}
