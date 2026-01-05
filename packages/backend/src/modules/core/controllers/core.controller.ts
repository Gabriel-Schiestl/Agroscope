import {
    Controller,
    Get,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { GetHistoryUseCase } from '../application/usecases/GetHistory.usecase';
import { PredictUseCase } from '../application/usecases/Predict.usecase';
import { UseFileInterceptor } from '../infra/services/File.interceptor';

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
        const result = await this.predictUseCase.execute({
            imagePath: file.path,
            userId: req['user'].sub,
        });

        return result;
    }

    @Get('history')
    async getHistory(@Req() req: Request) {
        const result = await this.getHistoryUseCase.execute({
            userId: req['user'].sub,
        });

        return result;
    }
}
