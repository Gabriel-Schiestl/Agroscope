import { Provider } from '@nestjs/common';
import { PredictServiceImpl } from './Predict.service';

export const services: Provider[] = [
    {
        provide: 'PredictService',
        useClass: PredictServiceImpl,
    },
];
