import {
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { PredictUseCase } from '../application/usecases/Predict.usecase';
import { UseFileInterceptor } from '../infra/services/File.interceptor';
import { Request, Response } from 'express';
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
    async predict(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ) {
        const result = await this.predictUseCase.execute(
            file.path,
            req['session'].sub,
        );

        return result;
    }

    @Get('history')
    async getHistory(@Req() req: Request) {
        const result = await this.getHistoryUseCase.execute(req['session'].sub);

        return result;
    }
}
