import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData = require('form-data'); // Correção aqui
import { KnowledgeRepository } from '../../domain/repositories/Knowledge.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';
import * as fs from 'fs';
import * as path from 'path';

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
        return {
          data: {
            prediction: result.data.prediction,
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
        sickness.id,
      );
      if (knowledge instanceof Error)
        return {
          exception: new Error('Conhecimento não encontrado na base'),
          success: false,
        };

      return {
        data: {
          prediction: result.data.prediction,
          handling: knowledge.handling,
        },
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error while trying to predict image');
    }
  }
}
