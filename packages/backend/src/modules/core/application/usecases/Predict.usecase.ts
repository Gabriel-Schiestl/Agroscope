import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData = require('form-data'); // Correção aqui
import { KnowledgeRepository } from '../../domain/repositories/Knowledge.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';
import * as fs from 'fs';
import * as path from 'path';
import { Sickness } from '../../domain/models/Sickness';
import isInstanceOf from 'src/shared/TypeGuard';
import { Knowledge } from '../../domain/models/Knowledge';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { History } from '../../domain/models/History';
import e = require('express');
import { SaveImageQuery } from '../query/SaveImage.query';
import { Res, Result } from 'src/shared/Result';
import { Exception } from 'src/shared/Exception';

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
export class PredictUseCase {
    constructor(
        @Inject('SicknessRepository')
        private readonly sicknessRepository: SicknessRepository,
        @Inject('KnowledgeRepository')
        private readonly knowledgeRepository: KnowledgeRepository,
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
        private readonly saveImageQuery: SaveImageQuery,
    ) {}

    async execute(
        imagePath: string,
    ): Promise<Result<Exception, PredictUseCaseResponse>> {
        const formData = new FormData();

        const image = fs.createReadStream(imagePath);

        formData.append('image', image, {
            filename: path.basename(imagePath),
            contentType: 'image/*',
        });

        const result = await axios.post(
            `${process.env.FLASK_API_URL}/predict`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
            },
        );

        const imageBase64 = await fs.promises.readFile(imagePath, {
            encoding: 'base64',
        });

        const saveImageResult = await this.saveImageQuery.execute(
            imageBase64,
            result.data.prediction,
        );

        if (result.data.prediction === 'saudavel') {
            const history = History.create({
                image: imageBase64,
                prediction: 'saudavel',
            });

            const result = await this.historyRepository.save(history);

            return Res.success({
                prediction: 'saudavel',
                handling: 'Nenhuma ação necessária',
            });
        }

        const sickness = await this.sicknessRepository.getSicknessByName(
            result.data.prediction,
        );
        if (sickness.isFailure()) return Res.failure(sickness.error);

        const knowledge = await this.knowledgeRepository.getKnowledge(
            sickness instanceof Sickness && sickness.id,
        );
        if (knowledge.isFailure()) return Res.failure(knowledge.error);

        const history = History.create({
            handling: knowledge.value.handling,
            image: imageBase64,
            prediction: result.data.prediction,
        });

        const saveHistoryResult = await this.historyRepository.save(history);

        return Res.success({
            prediction: result.data.prediction,
            handling: knowledge.value.handling,
        });
    }
}
