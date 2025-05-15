import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CalendarModule } from '../calendar/calendar.module';
import { EngineerModule } from '../engineer/engineer.module';
import { queries } from './application/query';
import { useCases } from './application/usecases';
import { controllers } from './controllers';
import { repositories } from './infra/repositories';
import { services } from './infra/services';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        HttpModule,
        forwardRef(() => CalendarModule),
        forwardRef(() => EngineerModule),
        SharedModule,
    ],
    controllers: [...controllers],
    providers: [...useCases, ...queries, ...repositories, ...services],
    exports: [...repositories, ...services],
})
export class CoreModule {}
