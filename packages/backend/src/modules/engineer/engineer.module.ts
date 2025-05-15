import { forwardRef, Module } from '@nestjs/common';
import { engineerUseCases } from './application/usecases';
import { repositories } from './infra/repositories';
import { EngineerController } from './controllers/Engineer.controller';
import { CalendarModule } from '../calendar/calendar.module';
import { CoreModule } from '../core/core.module';

@Module({
    imports: [forwardRef(() => CalendarModule), forwardRef(() => CoreModule)],
    controllers: [EngineerController],
    providers: [...engineerUseCases, ...repositories],
    exports: [...repositories],
})
export class EngineerModule {}
