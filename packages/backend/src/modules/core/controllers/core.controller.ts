import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PredictUseCase } from '../application/usecases/Predict.usecase';
import { UseFileInterceptor } from '../infra/services/File.interceptor';

@Controller()
export class CoreController {
  constructor(private readonly predictUseCase: PredictUseCase) {}

  @Post('predict')
  @UseInterceptors(UseFileInterceptor)
  async predict(@UploadedFile() file: Express.Multer.File) {
    return this.predictUseCase.execute(file);
  }
}
