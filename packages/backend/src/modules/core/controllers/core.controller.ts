import {
    Body,
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

class PredictBody {
    latitude?: string;
    longitude?: string;
}

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
        @Body() body: PredictBody,
        @Req() req: Request,
    ) {
        const location = this.parseLocation(body);

        return this.predictUseCase.execute({
            imagePath: file.path,
            userId: req['user'].sub,
            location,
        });
    }

    @Get('history')
    async getHistory(@Req() req: Request) {
        return this.getHistoryUseCase.execute({
            userId: req['user'].sub,
        });
    }

    private parseLocation(
        body: PredictBody,
    ): { latitude: number; longitude: number } | undefined {
        const lat = parseFloat(body.latitude);
        const lon = parseFloat(body.longitude);

        if (isNaN(lat) || isNaN(lon)) return undefined;
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return undefined;

        return { latitude: lat, longitude: lon };
    }
}
