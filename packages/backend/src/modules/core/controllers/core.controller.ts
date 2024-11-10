import { Controller, Post } from '@nestjs/common';
import { PredictUseCase } from '../application/usecases/Predict.usecase';

@Controller('core')
export class CoreController {
  constructor(private readonly predictUseCase: PredictUseCase) {}

  @Post()
  async predict() {}
}
