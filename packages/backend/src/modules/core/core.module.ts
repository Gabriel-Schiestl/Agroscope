import { forwardRef, Module } from '@nestjs/common';
import { queries } from './application/query';
import { useCases } from './application/usecases';
import { repositories } from './infra/repositories';
import { AuthModule } from '../auth/auth.module';
import { controllers } from './controllers';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [...controllers],
    providers: [...useCases, ...queries, ...repositories],
    exports: [...repositories],
})
export class CoreModule {}
