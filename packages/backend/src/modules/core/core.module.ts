import { forwardRef, Module } from '@nestjs/common';
import { queries } from './application/query';
import { useCases } from './application/usecases';
import { repositories } from './infra/repositories';
import { AuthModule } from '../auth/auth.module';
import { controllers } from './controllers';
import { HttpModule } from '@nestjs/axios';
import { services } from './infra/services';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EngineerGuard } from './infra/services/Engineer.guard';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        HttpModule,
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
    controllers: [...controllers],
    providers: [
        ...useCases,
        ...queries,
        ...repositories,
        EngineerGuard,
        ...services,
    ],
    exports: [...repositories, ...services],
})
export class CoreModule {}
