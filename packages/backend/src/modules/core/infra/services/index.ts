import { PredictServiceImpl } from './Predict.service';
import { ProducerServiceImpl } from './Producer.service';

export const services = [
    {
        provide: 'PredictService',
        useClass: PredictServiceImpl,
    },
    {
        provide: 'ProducerService',
        useClass: ProducerServiceImpl,
    },
];
