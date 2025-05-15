import { Module } from '@nestjs/common';
import { sharedServices } from './infra/services';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL],
                    queue: 'images',
                    queueOptions: {
                        durable: true,
                    },
                },
            },
            {
                name: 'RABBITMQ_EMAIL_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL],
                    queue: 'email-service',
                    queueOptions: {
                        durable: true,
                    },
                },
            },
        ]),
    ],
    providers: [...sharedServices],
    exports: [
        'ProducerFactoryService',
        'ProducerService',
        'EmailProducerService',
    ],
})
export class SharedModule {}
