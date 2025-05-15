import { forwardRef, Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { calendarUseCases } from './application/usecases';
import { CalendarController } from './controllers/Calendar.controller';
import { repositories } from './infra/repositories';
import { services } from './infra/services';
import { EngineerModule } from '../engineer/engineer.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [
        forwardRef(() => CoreModule),
        forwardRef(() => EngineerModule),
        SharedModule,
    ],
    controllers: [CalendarController],
    providers: [...repositories, ...calendarUseCases, ...services],
    exports: [...repositories],
})
export class CalendarModule {}
