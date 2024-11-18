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
  data: T | void;
  success: boolean;
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
    console.log(imagePath);
    const formData = new FormData();

    const image = fs.createReadStream(imagePath);
    console.log(image);

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

      const sickness = await this.sicknessRepository.getSicknessByName(
        result.data.prediction,
      );
      if (sickness instanceof Error) throw new Error('Sickness not found');

      const knowledge = await this.knowledgeRepository.getKnowledge(
        sickness.id,
      );
      if (knowledge instanceof Error) throw new Error('Knowledge not found');

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
