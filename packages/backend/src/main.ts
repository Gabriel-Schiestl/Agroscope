import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ResponseInterceptor } from './shared/Response.interceptor';
import { AuthGuard } from './modules/auth/infra/services/Auth.guard';

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

    await app.listen(3000);
}
bootstrap();
