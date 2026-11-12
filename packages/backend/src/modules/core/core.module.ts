import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { queries } from './application/query';
import { applicationServices } from './application/services';
import { useCases } from './application/usecases';
import { controllers } from './controllers';
import { repositories } from './infra/repositories';
import { services } from './infra/services';
import { jobs } from './infra/jobs';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [forwardRef(() => AuthModule), HttpModule, SharedModule],
    controllers: [...controllers],
    providers: [
        ...useCases,
        ...queries,
        ...applicationServices,
        ...repositories,
        ...services,
        ...jobs,
        {
            provide: 'OPEN_METEO_API_URL',
            useValue:
                process.env.OPEN_METEO_API_URL ||
                'https://api.open-meteo.com/v1/forecast',
        },
        {
            provide: 'TERMS_VERSION',
            useValue: process.env.TERMS_VERSION || '2026-11-11',
        },
    ],
    exports: [...repositories, ...services],
})
export class CoreModule {}
