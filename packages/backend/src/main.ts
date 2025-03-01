import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ResponseInterceptor } from './shared/Response.interceptor';

config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(app.get(ResponseInterceptor));

    app.enableCors();
    await app.listen(3000);
}
bootstrap();
