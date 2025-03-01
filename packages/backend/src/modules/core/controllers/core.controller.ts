import {
    Controller,
    Get,
    HttpStatus,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { PredictUseCase } from '../application/usecases/Predict.usecase';
import { UseFileInterceptor } from '../infra/services/File.interceptor';
import { Response } from 'express';
import { GetHistoryUseCase } from '../application/usecases/GetHistory.usecase';
import { Failure } from 'src/shared/Result';

@Controller()
export class CoreController {
    constructor(
        private readonly predictUseCase: PredictUseCase,
        private readonly getHistoryUseCase: GetHistoryUseCase,
    ) {}

    @Post('predict')
    @UseInterceptors(UseFileInterceptor)
    async predict(@UploadedFile() file: Express.Multer.File) {
        const result = await this.predictUseCase.execute(file.path);

        return result;
    }

    @Get('history')
    async getHistory() {
        const result = await this.getHistoryUseCase.execute();

        return result;
    }
}
