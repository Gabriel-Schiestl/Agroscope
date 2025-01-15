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
    ) {}

    async execute(
        imagePath: string,
    ): Promise<UseCasesResponse<PredictUseCaseResponse>> {
        const formData = new FormData();

        const image = fs.createReadStream(imagePath);

        formData.append('image', image, {
            filename: path.basename(imagePath),
            contentType: 'image/*',
        });

        try {
            const result = await axios.post(
                `${process.env.FLASK_API_URL}/predict`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                    },
                },
            );

            if (result.data.prediction === 'saudavel') {
                const imageBase64 = await fs.promises.readFile(imagePath, {
                    encoding: 'base64',
                });

                const history = History.create({
                    image: imageBase64,
                    prediction: 'saudavel',
                });

                const result = await this.historyRepository.save(history);

                return {
                    data: {
                        prediction: 'saudavel',
                        handling:
                            'A planta está saudável e não precisa de cuidados especiais',
                    },
                    success: true,
                };
            }

            const sickness = await this.sicknessRepository.getSicknessByName(
                result.data.prediction,
            );
            if (sickness instanceof Error)
                return {
                    exception: new Error('Doença não encontrada na base'),
                    success: false,
                };

            const knowledge = await this.knowledgeRepository.getKnowledge(
                sickness instanceof Sickness && sickness.id,
            );
            if (knowledge instanceof Error)
                return {
                    exception: new Error('Conhecimento não encontrado na base'),
                    success: false,
                };

            const imageBase64 = await fs.promises.readFile(imagePath, {
                encoding: 'base64',
            });

            const history = History.create({
                handling: knowledge.handling,
                image: imageBase64,
                prediction: result.data.prediction,
            });

            const saveHistoryResult =
                await this.historyRepository.save(history);

            if (Knowledge.isKnowledge(knowledge)) {
                return {
                    data: {
                        prediction: result.data.prediction,
                        handling: knowledge.handling,
                    },
                    success: true,
                };
            }
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}
