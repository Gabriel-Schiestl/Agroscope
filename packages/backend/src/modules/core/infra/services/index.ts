import { PredictServiceImpl } from './Predict.service';
import { ProducerServiceImpl } from './Producer.service';
import { EventMonitorService } from './EventMonitor.service';

export const services = [
    {
        provide: 'PredictService',
        useClass: PredictServiceImpl,
    },
    {
        provide: 'ProducerService',
        useClass: ProducerServiceImpl,
    },
    EventMonitorService,
];
