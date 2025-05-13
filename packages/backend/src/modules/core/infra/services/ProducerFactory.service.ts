import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProducerService } from '../../domain/services/Producer.service';
import {
    ProducerFactoryService,
    ProducerType,
} from '../../domain/services/ProducerFactory.service';

@Injectable()
export class ProducerFactoryServiceImpl implements ProducerFactoryService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly imageClient: ClientProxy,
        @Inject('RABBITMQ_EMAIL_SERVICE')
        private readonly emailClient: ClientProxy,
    ) {}

    createProducer(type: ProducerType): ProducerService {
        switch (type) {
            case 'image':
                return {
                    sendMessage: <T>(pattern: string, message: T): void => {
                        this.imageClient.emit(pattern, message);
                    },
                };
            case 'email':
                return {
                    sendMessage: <T>(pattern: string, message: T): void => {
                        this.emailClient.emit(pattern, message);
                    },
                };
            default:
                throw new Error(`Tipo de produtor não suportado: ${type}`);
        }
    }
}
