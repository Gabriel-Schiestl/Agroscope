import { forwardRef, Module } from '@nestjs/common';
import { CoreController } from './controllers/core.controller';
import { queries } from './application/query';
import { useCases } from './application/usecases';
import { repositories } from './infra/repositories';
import { mappers } from './infra/mappers';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [CoreController],
    providers: [...useCases, ...queries, ...mappers, ...repositories],
    exports: [...repositories],
})
export class CoreModule {}
