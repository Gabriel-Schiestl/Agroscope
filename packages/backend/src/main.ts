import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ResponseInterceptor } from './shared/Response.interceptor';
import { AuthGuard } from './modules/auth/infra/services/Auth.guard';
import { Transport } from '@nestjs/microservices';
import { doubleCsrf } from 'csrf-csrf';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ThrottlerGuard } from '@nestjs/throttler';

config();

const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    cookieName: 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
    },
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.use(cookieParser());
    app.use(doubleCsrfProtection);

    app.use(
        helmet({
            frameguard: { action: 'deny' },
            noSniff: true,
            strictTransportSecurity: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            contentSecurityPolicy: true,
            referrerPolicy: { policy: 'no-referrer' },
            crossOriginEmbedderPolicy: true,
            crossOriginResourcePolicy: { policy: 'same-origin' },
            crossOriginOpenerPolicy: { policy: 'same-origin' },
        }),
    );

    app.useGlobalInterceptors(app.get(ResponseInterceptor));

    app.useGlobalGuards(app.get(AuthGuard));

    app.enableCors({
        origin: process.env.CORS_ORIGINS.split(','),
        credentials: true,
        exposedHeaders: ['Authorization', 'X-CSRF-TOKEN'],
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

    await app.listen(3001);
}
bootstrap();
