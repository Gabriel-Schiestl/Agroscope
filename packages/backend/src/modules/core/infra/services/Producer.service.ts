import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProducerService } from '../../domain/services/Producer.service';

@Injectable()
export class ProducerServiceImpl implements ProducerService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) {}

    sendMessage<T>(pattern: string, message: T): void {
        this.client.emit(pattern, message);
    }
}
