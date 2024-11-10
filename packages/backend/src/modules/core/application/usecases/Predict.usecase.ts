import { Injectable } from '@nestjs/common';

@Injectable()
export class PredictUseCase {
  async execute() {
    return 'Hello World';
  }
}
