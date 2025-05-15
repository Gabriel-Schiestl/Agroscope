import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { KnowledgeRepository } from '../../domain/repositories/Knowledge.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';
import { PredictService } from '../../domain/services/Predict.service';

// Technical Exeption Import
import { TechnicalException } from '../../../../shared/exceptions/Technical.exception';
import { HistoryDto } from '../dto/History.dto';
import { HistoryAppMapper } from '../mappers/History.mapper';
import { ProducerService } from 'src/shared/domain/services/Producer.service';

@Injectable()
export class PredictUseCase extends AbstractUseCase<
    { imagePath: string; userId: string },
    Exception,
    HistoryDto
> {
    constructor(
        @Inject('SicknessRepository')
        private readonly sicknessRepository: SicknessRepository,
        @Inject('KnowledgeRepository')
        private readonly knowledgeRepository: KnowledgeRepository,
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
        @Inject('PredictService')
        private readonly predictService: PredictService,
        @Inject('ProducerService')
        private readonly producerService: ProducerService,
    ) {
        super();
    }

    async onExecute({
        imagePath,
        userId,
    }: {
        imagePath: string;
        userId: string;
    }): Promise<Result<Exception, HistoryDto>> {
        try {
            const result = await this.predictService.predict(imagePath);
            if (result.isFailure()) {
                console.error('Falha na predição:', result.error);
                return Res.failure(result.error);
            }

            const imageBase64 =
                await this.predictService.getImageBase64(imagePath);
            if (imageBase64.isFailure()) return Res.failure(imageBase64.error);

            if (result.value.prediction.includes('saudavel')) {
                const history = History.create({
                    image: imageBase64.value,
                    userId: userId,
                    handling: 'Nenhuma ação necessária',
                    crop: null,
                    sickness: null,
                    cropConfidence: null,
                });

                const saveResult = await this.historyRepository.save(history);
                if (saveResult.isFailure())
                    return Res.failure(saveResult.error);

                this.sendImage('saudavel', imageBase64.value);

                return Res.success(HistoryAppMapper.toDto(history));
            }

            const sickness = await this.sicknessRepository.getSicknessByName(
                result.value.prediction,
            );
            if (sickness.isFailure()) {
                console.error(
                    'Doença não encontrada no banco de dados:',
                    result.value.prediction,
                );
                return Res.failure(sickness.error);
            }

            const knowledge = await this.knowledgeRepository.getKnowledge(
                sickness.value.id,
            );
            if (knowledge.isFailure()) {
                console.error(
                    'Conhecimento não encontrado para a doença:',
                    sickness.value.id,
                );
                console.error('Erro detalhado:', knowledge.error);
                return Res.failure(knowledge.error);
            }

            const history = History.create({
                handling: knowledge.value.handling,
                image: imageBase64.value,
                sickness: sickness.value,
                userId: userId,
                crop: result.value.plant,
                cropConfidence: result.value.plantConfidence,
            });

            const saveHistoryResult =
                await this.historyRepository.save(history);
            if (saveHistoryResult.isFailure())
                return Res.failure(saveHistoryResult.error);

            this.sendImage(result.value.prediction, imageBase64.value);

            return Res.success(HistoryAppMapper.toDto(history));
        } catch (error) {
            console.error(
                'Erro não tratado no caso de uso de predição:',
                error,
            );
            return Res.failure(
                new TechnicalException(`Erro inesperado: ${error.message}`),
            );
        }
    }

    private async sendImage(prediction: string, image: string) {
        const payload = {
            prediction: prediction,
            image: image,
        };

        this.producerService.sendMessage('image', payload);
    }
}
