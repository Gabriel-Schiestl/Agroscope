import { Provider } from '@nestjs/common';
import { PredictServiceImpl } from './Predict.service';
import { OpenMeteoWeatherService } from './OpenMeteoWeather.service';

export const services: Provider[] = [
    {
        provide: 'PredictService',
        useClass: PredictServiceImpl,
    },
    {
        provide: 'WeatherService',
        useClass: OpenMeteoWeatherService,
    },
];
