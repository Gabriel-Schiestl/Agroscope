import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ResponseInterceptor } from './shared/Response.interceptor';
import { AuthGuard } from './modules/auth/infra/services/Auth.guard';
import { Transport } from '@nestjs/microservices';

config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(app.get(ResponseInterceptor));

    app.useGlobalGuards(app.get(AuthGuard));

    app.enableCors({
        origin: true,
        credentials: true,
        exposedHeaders: ['Authorization'],
    });

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL],
            queue: 'images',
            queueOptions: {
                durable: false,
            },
        },
    });

    await app.listen(3000);
}
bootstrap();
