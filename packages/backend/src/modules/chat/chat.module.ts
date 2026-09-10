import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { chatUseCases } from './application/usecases';
import { chatControllers, chatGateways } from './controllers';
import { chatRepositories } from './infra/repositories';
import { chatServices } from './infra/services';

@Module({
    imports: [HttpModule, forwardRef(() => AuthModule), CoreModule, SharedModule],
    controllers: [...chatControllers],
    providers: [
        ...chatUseCases,
        ...chatRepositories,
        ...chatServices,
        ...chatGateways,
        {
            provide: 'HISTORY_CONTEXT_LIMIT',
            useValue: process.env.HISTORY_CONTEXT_LIMIT
                ? parseInt(process.env.HISTORY_CONTEXT_LIMIT, 10)
                : 20,
        },
        {
            provide: 'N8N_WEBHOOK_URL',
            useValue: process.env.N8N_WEBHOOK_URL,
        },
    ],
})
export class ChatModule {}
