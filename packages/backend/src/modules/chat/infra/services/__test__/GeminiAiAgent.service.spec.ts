import { GeminiClientService } from 'src/shared/domain/services/GeminiClient.service';
import { GeminiAiAgentService } from '../GeminiAiAgent.service';

describe('GeminiAiAgentService', () => {
    let geminiClient: jest.Mocked<GeminiClientService>;
    let service: GeminiAiAgentService;

    beforeEach(() => {
        geminiClient = {
            generateContent: jest.fn(),
        };
        service = new GeminiAiAgentService(geminiClient);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return the trimmed response text on success', async () => {
        geminiClient.generateContent.mockResolvedValue('  resposta final  ');

        const result = await service.sendMessage({
            message: 'Qual a causa?',
            userId: 'user-1',
            sessionId: 'session-1',
            analysisContext: {
                crop: 'Soja',
                cropConfidence: 0.9,
                sicknessConfidence: 0.8,
                explanation: 'explicação',
                causes: 'causas',
                handling: 'manejo',
                precautions: 'precauções',
            },
            history: [
                { sender: 'human', content: 'Oi', createdAt: new Date() },
                { sender: 'ai', content: 'Olá', createdAt: new Date() },
            ],
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('resposta final');

        const call = geminiClient.generateContent.mock.calls[0][0];
        expect(call.contents).toEqual([
            { role: 'user', text: 'Oi' },
            { role: 'model', text: 'Olá' },
            { role: 'user', text: 'Qual a causa?' },
        ]);
        expect(call.systemInstruction).toContain('Soja');
        expect(call.systemInstruction).toContain('explicação');
    });

    it('should use default values when analysisContext is missing', async () => {
        geminiClient.generateContent.mockResolvedValue('resposta');

        await service.sendMessage({
            message: 'Oi',
            userId: 'user-1',
            sessionId: 'session-1',
            history: [],
        });

        const call = geminiClient.generateContent.mock.calls[0][0];
        expect(call.systemInstruction).toContain('Não informado');
    });

    it('should fail when the response text is empty', async () => {
        geminiClient.generateContent.mockResolvedValue('');

        const result = await service.sendMessage({
            message: 'Oi',
            userId: 'user-1',
            sessionId: 'session-1',
            history: [],
        });

        expect(result.isFailure()).toBe(true);
    });

    it('should fail when Gemini throws', async () => {
        geminiClient.generateContent.mockRejectedValue(new Error('timeout'));

        const result = await service.sendMessage({
            message: 'Oi',
            userId: 'user-1',
            sessionId: 'session-1',
            history: [],
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toBe('timeout');
    });
});
