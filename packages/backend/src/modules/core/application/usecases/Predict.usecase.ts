import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { KnowledgeRepository } from '../../domain/repositories/Knowledge.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';
import FormData = require('form-data'); // Correção aqui
import e = require('express');
import { PredictService } from '../../domain/services/Predict.service';
import { ProducerService } from '../../domain/services/Producer.service';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export interface PredictUseCaseResponse {
    prediction: string;
    handling: string;
}

export interface UseCasesResponse<T> {
    data?: T | void;
    success: boolean;
    exception?: Error;
}

@Injectable()
export class PredictUseCase extends AbstractUseCase<
    { imagePath: string; userId: string },
    Exception,
    PredictUseCaseResponse
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
    }): Promise<Result<Exception, PredictUseCaseResponse>> {
        const result = await this.predictService.predict(imagePath);
        if (result.isFailure()) return Res.failure(result.error);

        const imageBase64 = await this.predictService.getImageBase64(imagePath);
        if (imageBase64.isFailure()) return Res.failure(imageBase64.error);

        if (result.value.prediction === 'saudavel') {
            const history = History.create({
                image: imageBase64.value,
                userId: userId,
            });

            const saveResult = await this.historyRepository.save(history);
            if (saveResult.isFailure()) return Res.failure(saveResult.error);

            this.sendImage('saudavel', imageBase64.value);

            return Res.success({
                prediction: 'saudavel',
                handling: 'Nenhuma ação necessária',
            });
        }

        const sickness = await this.sicknessRepository.getSicknessByName(
            result.value.prediction,
        );
        if (sickness.isFailure()) return Res.failure(sickness.error);

        const knowledge = await this.knowledgeRepository.getKnowledge(
            sickness.value.id,
        );
        if (knowledge.isFailure()) return Res.failure(knowledge.error);

        const history = History.create({
            handling: knowledge.value.handling,
            image: imageBase64.value,
            sickness: sickness.value,
            userId: userId,
        });

        const saveHistoryResult = await this.historyRepository.save(history);
        if (saveHistoryResult.isFailure())
            return Res.failure(saveHistoryResult.error);

        this.sendImage(result.value.prediction, imageBase64.value);

        return Res.success({
            prediction: result.value.prediction,
            handling: knowledge.value.handling,
        });
    }

    private async sendImage(prediction: string, image: string) {
        const payload = {
            prediction: prediction,
            image: image,
        };

        this.producerService.sendMessage('image', payload);
    }
}
