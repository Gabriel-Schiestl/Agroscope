import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AiAgentPayload } from '../../../domain/services/AiAgent.service';
import { N8nAiAgentService } from '../N8nAiAgent.service';

describe('N8nAiAgentService', () => {
    let httpService: jest.Mocked<HttpService>;

    const payload: AiAgentPayload = {
        message: 'Olá',
        userId: 'user-1',
        sessionId: 'session-1',
        history: [],
    };

    beforeEach(() => {
        httpService = { post: jest.fn() } as unknown as jest.Mocked<HttpService>;
    });

    it('should fail when the webhook URL is not configured', async () => {
        const service = new N8nAiAgentService(httpService, '');

        const result = await service.sendMessage(payload);

        expect(result.isFailure()).toBe(true);
        expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should return the response text on success', async () => {
        httpService.post.mockReturnValue(
            of({ data: { response: 'resposta do agente' } }) as any,
        );
        const service = new N8nAiAgentService(
            httpService,
            'https://n8n.example.com/webhook',
        );

        const result = await service.sendMessage(payload);

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('resposta do agente');
        expect(httpService.post).toHaveBeenCalledWith(
            'https://n8n.example.com/webhook',
            payload,
        );
    });

    it('should fail when the response has no "response" field', async () => {
        httpService.post.mockReturnValue(of({ data: {} }) as any);
        const service = new N8nAiAgentService(
            httpService,
            'https://n8n.example.com/webhook',
        );

        const result = await service.sendMessage(payload);

        expect(result.isFailure()).toBe(true);
    });

    it('should fail when the request throws', async () => {
        httpService.post.mockReturnValue(
            throwError(() => new Error('network error')) as any,
        );
        const service = new N8nAiAgentService(
            httpService,
            'https://n8n.example.com/webhook',
        );

        const result = await service.sendMessage(payload);

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toBe(
            'network error',
        );
    });
});
