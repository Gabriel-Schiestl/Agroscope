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
    async predict(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        try {
            const result = await this.predictUseCase.execute(file.path);

            if (!result.success) {
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({ message: result.exception?.message });
            }

            return res.status(HttpStatus.OK).json(result);
        } catch (e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: e.message,
                error: e.stack,
            });
        }
    }

    @Get('history')
    async getHistory(@Res() res: Response) {
        try {
            const result = await this.getHistoryUseCase.execute();

            if (result instanceof Failure) {
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({ message: result.error.message });
            }

            return res.status(HttpStatus.OK).json(result);
        } catch (e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: e.message,
                error: e.stack,
            });
        }
    }
}
