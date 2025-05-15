import { ProducerFactoryService } from 'src/shared/domain/services/ProducerFactory.service';
import { ProducerFactoryServiceImpl } from './ProducerFactory.service';
import { Provider } from '@nestjs/common';
import { EngineerGuard } from './Engineer.guard';

export const sharedServices: Provider[] = [
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
    EngineerGuard,
];
