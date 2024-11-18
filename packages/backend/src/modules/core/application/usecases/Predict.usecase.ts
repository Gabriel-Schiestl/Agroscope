import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { KnowledgeRepository } from '../../domain/repositories/Knowledge.repository';
import { SicknessRepository } from '../../domain/repositories/Sickness.repository';

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
    private readonly sicknessRepository: SicknessRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
  ) {}

  async execute(
    image: Express.Multer.File,
  ): Promise<UseCasesResponse<PredictUseCaseResponse>> {
    const formData = new FormData();

    formData.append('image', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
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
