import { Provider } from '@nestjs/common';
import { PredictServiceImpl } from './Predict.service';
import { MockPredictService } from './MockPredict.service';
import { IaCropCatalogService } from './IaCropCatalog.service';
import { MockCropCatalogService } from './MockCropCatalog.service';
import { OpenMeteoWeatherService } from './OpenMeteoWeather.service';
import { GeminiHandlingService } from './GeminiHandling.service';

const isMockAi = process.env.MOCK_AI === 'true';

export const services: Provider[] = [
    {
        provide: 'PredictService',
        useClass: isMockAi ? MockPredictService : PredictServiceImpl,
    },
    {
        provide: 'CropCatalogService',
        useClass: isMockAi ? MockCropCatalogService : IaCropCatalogService,
    },
    {
        provide: 'WeatherService',
        useClass: OpenMeteoWeatherService,
    },
    {
        provide: 'HandlingLlmService',
        useClass: GeminiHandlingService,
    },
];
