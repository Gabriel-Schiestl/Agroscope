import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'ormconfig';
import { CoreModule } from './modules/core/core.module';
import { ResponseInterceptor } from './shared/Response.interceptor';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [TypeOrmModule.forRoot(OrmConfig), CoreModule, AuthModule],
    providers: [ResponseInterceptor],
})
export class AppModule {}
