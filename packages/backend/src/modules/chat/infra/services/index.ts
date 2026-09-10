import { Provider } from '@nestjs/common';
import { N8nAiAgentService } from './N8nAiAgent.service';
import { MockAiAgentService } from './MockAiAgent.service';
import { GeminiAiAgentService } from './GeminiAiAgent.service';
import { FallbackAiAgentService } from './FallbackAiAgent.service';

const isMockAi = process.env.MOCK_AI === 'true';

export const chatServices: Provider[] = [
    GeminiAiAgentService,
    N8nAiAgentService,
    FallbackAiAgentService,
    {
        provide: 'AiAgentService',
        useClass: isMockAi ? MockAiAgentService : FallbackAiAgentService,
    },
];
