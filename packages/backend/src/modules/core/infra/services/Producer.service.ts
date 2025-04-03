import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ProducerService } from '../../domain/services/Producer.service';

@Injectable()
export class ProducerServiceImpl implements ProducerService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) {}

    sendMessage(pattern: string, message: string): void {
        this.client.emit(pattern, message);
    }
}
