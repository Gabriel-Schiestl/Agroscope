import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { ResponseInterceptor } from './shared/Response.interceptor';
import {
    ThrottlerGuard,
    ThrottlerModule,
    ThrottlerStorage,
} from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
    imports: [
        TypeOrmModule.forRoot(OrmConfig),
        CoreModule,
        AuthModule,
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: Number(process.env.THROTTLE_SHORT_TTL),
                limit: Number(process.env.THROTTLE_SHORT_LIMIT),
            },
            {
                name: 'medium',
                ttl: Number(process.env.THROTTLE_MEDIUM_TTL),
                limit: Number(process.env.THROTTLE_MEDIUM_LIMIT),
            },
            {
                name: 'long',
                ttl: Number(process.env.THROTTLE_LONG_TTL),
                limit: Number(process.env.THROTTLE_LONG_LIMIT),
            },
        ]),
    ],
    providers: [
        ResponseInterceptor,
        {
            provide: APP_GUARD,
            useFactory: (options, storageService, reflector) => {
                return new ThrottlerGuard(options, storageService, reflector);
            },
            inject: ['THROTTLER:MODULE_OPTIONS', ThrottlerStorage, Reflector],
        },
    ],
})
export class AppModule {}
