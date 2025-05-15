import { ProducerService } from './Producer.service';

export type ProducerType = 'image' | 'email';

export interface ProducerFactoryService {
    createProducer(type: ProducerType): ProducerService;
}
