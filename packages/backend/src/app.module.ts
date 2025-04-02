import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { ResponseInterceptor } from './shared/Response.interceptor';

@Module({
    imports: [TypeOrmModule.forRoot(OrmConfig), CoreModule, AuthModule],
    providers: [ResponseInterceptor],
})
export class AppModule {}
