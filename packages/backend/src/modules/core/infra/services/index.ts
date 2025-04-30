import { PredictServiceImpl } from './Predict.service';
import { EventMonitorService } from './EventMonitor.service';
import { ProducerFactoryServiceImpl } from './ProducerFactory.service';
import { Provider } from '@nestjs/common';
import { ProducerFactoryService } from '../../domain/services/ProducerFactory.service';

export const services: Provider[] = [
    {
        provide: 'PredictService',
        useClass: PredictServiceImpl,
    },
    {
        provide: 'ProducerFactoryService',
        useClass: ProducerFactoryServiceImpl,
    },
    {
        provide: 'ProducerService',
        useFactory: (factoryService: ProducerFactoryService) => {
            return factoryService.createProducer('image');
        },
        inject: ['ProducerFactoryService'],
    },
    {
        provide: 'EmailProducerService',
        useFactory: (factoryService: ProducerFactoryService) => {
            return factoryService.createProducer('email');
        },
        inject: ['ProducerFactoryService'],
    },
    {
        provide: EventMonitorService,
        useClass: EventMonitorService,
    },
];
