import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res } from 'src/shared/Result';
import { AiAgentPayload } from '../../../domain/services/AiAgent.service';
import { FallbackAiAgentService } from '../FallbackAiAgent.service';
import { GeminiAiAgentService } from '../GeminiAiAgent.service';
import { N8nAiAgentService } from '../N8nAiAgent.service';

describe('FallbackAiAgentService', () => {
    let geminiAiAgentService: jest.Mocked<GeminiAiAgentService>;
    let n8nAiAgentService: jest.Mocked<N8nAiAgentService>;
    let service: FallbackAiAgentService;

    const payload: AiAgentPayload = {
        message: 'Oi',
        userId: 'user-1',
        sessionId: 'session-1',
        history: [],
    };

    beforeEach(() => {
        geminiAiAgentService = {
            sendMessage: jest.fn(),
        } as unknown as jest.Mocked<GeminiAiAgentService>;
        n8nAiAgentService = {
            sendMessage: jest.fn(),
        } as unknown as jest.Mocked<N8nAiAgentService>;
        service = new FallbackAiAgentService(
            geminiAiAgentService,
            n8nAiAgentService,
        );
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return the Gemini result without calling n8n when Gemini succeeds', async () => {
        geminiAiAgentService.sendMessage.mockResolvedValue(
            Res.success('resposta gemini'),
        );

        const result = await service.sendMessage(payload);

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('resposta gemini');
        expect(n8nAiAgentService.sendMessage).not.toHaveBeenCalled();
    });

    it('should fall back to n8n when Gemini fails', async () => {
        geminiAiAgentService.sendMessage.mockResolvedValue(
            Res.failure(new TechnicalException('gemini indisponível')),
        );
        n8nAiAgentService.sendMessage.mockResolvedValue(
            Res.success('resposta n8n'),
        );

        const result = await service.sendMessage(payload);

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('resposta n8n');
        expect(n8nAiAgentService.sendMessage).toHaveBeenCalledWith(payload);
    });
});
