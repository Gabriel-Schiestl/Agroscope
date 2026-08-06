import { Provider } from '@nestjs/common';
import { N8nAiAgentService } from './N8nAiAgent.service';
import { MockAiAgentService } from './MockAiAgent.service';

const isMockAi = process.env.MOCK_AI === 'true';

export const chatServices: Provider[] = [
    {
        provide: 'AiAgentService',
        useClass: isMockAi ? MockAiAgentService : N8nAiAgentService,
    },
];
