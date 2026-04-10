import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { GetHistoryUseCase } from '../application/usecases/GetHistory.usecase';
import { GetHistoryByIdUseCase } from '../application/usecases/GetHistoryById.usecase';
import { GetLimitUseCase } from '../application/usecases/GetLimit.usecase';
import { PredictUseCase } from '../application/usecases/Predict.usecase';
import { UseFileInterceptor } from '../infra/services/File.interceptor';

class PredictBody {
    latitude?: string;
    longitude?: string;
}

class HistoryQuery {
    crop?: string;
    startDate?: string;
    endDate?: string;
    order?: 'ASC' | 'DESC';
}

@Controller()
export class CoreController {
    constructor(
        private readonly predictUseCase: PredictUseCase,
        private readonly getHistoryUseCase: GetHistoryUseCase,
        private readonly getHistoryByIdUseCase: GetHistoryByIdUseCase,
        private readonly getLimitUseCase: GetLimitUseCase,
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
    async getHistory(@Query() query: HistoryQuery, @Req() req: Request) {
        return this.getHistoryUseCase.execute({
            userId: req['user'].sub,
            filters: {
                crop: query.crop,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                order: query.order,
            },
        });
    }

    @Get('history/:id')
    async getHistoryById(@Param('id') id: string, @Req() req: Request) {
        return this.getHistoryByIdUseCase.execute({
            id,
            userId: req['user'].sub,
        });
    }

    @Get('limit')
    async getLimit(@Req() req: Request) {
        return this.getLimitUseCase.execute({
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
