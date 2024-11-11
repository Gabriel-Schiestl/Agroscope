import { Injectable } from '@nestjs/common';

@Injectable()
export class PredictUseCase {
  async execute(imagem: Express.Multer.File) {
    return 'Hello World';
  }
}
