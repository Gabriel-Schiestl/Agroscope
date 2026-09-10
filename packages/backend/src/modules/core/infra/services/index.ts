import { Provider } from '@nestjs/common';
import { PredictServiceImpl } from './Predict.service';
import { MockPredictService } from './MockPredict.service';
import { OpenMeteoWeatherService } from './OpenMeteoWeather.service';
import { GeminiHandlingService } from './GeminiHandling.service';

const isMockAi = process.env.MOCK_AI === 'true';

export const services: Provider[] = [
    {
        provide: 'PredictService',
        useClass: isMockAi ? MockPredictService : PredictServiceImpl,
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
