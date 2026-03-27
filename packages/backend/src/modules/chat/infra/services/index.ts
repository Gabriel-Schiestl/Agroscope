import { Provider } from '@nestjs/common';
import { N8nAiAgentService } from './N8nAiAgent.service';

export const chatServices: Provider[] = [
    {
        provide: 'AiAgentService',
        useClass: N8nAiAgentService,
    },
];
