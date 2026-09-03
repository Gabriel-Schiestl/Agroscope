import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { queries } from './application/query';
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
        ...repositories,
        ...services,
        ...jobs,
        {
            provide: 'OPEN_METEO_API_URL',
            useValue: 'https://api.open-meteo.com/v1/forecast', // TODO: Move to env
        },
        {
            provide: 'TERMS_VERSION',
            useValue: process.env.TERMS_VERSION || '2026-08-01',
        },
    ],
    exports: [...repositories, ...services],
})
export class CoreModule {}
