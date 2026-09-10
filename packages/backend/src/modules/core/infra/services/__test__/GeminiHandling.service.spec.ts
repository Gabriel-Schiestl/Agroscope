import { GeminiClientService } from 'src/shared/domain/services/GeminiClient.service';
import { GeminiHandlingService } from '../GeminiHandling.service';

describe('GeminiHandlingService', () => {
    let geminiClient: jest.Mocked<GeminiClientService>;
    let service: GeminiHandlingService;

    beforeEach(() => {
        geminiClient = {
            generateContent: jest.fn(),
        };
        service = new GeminiHandlingService(geminiClient);
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return the parsed handling data on a complete response', async () => {
        geminiClient.generateContent.mockResolvedValue(
            JSON.stringify({
                diagnostico: 'diag',
                explicacao: 'exp',
                sintomas: 'sintomas',
                causas: 'causas',
                manejo: 'manejo',
            }),
        );

        const result = await service.getHandling('Requeima', 'Tomate');

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.diagnostico).toBe('diag');
        expect(geminiClient.generateContent).toHaveBeenCalledWith(
            expect.objectContaining({
                contents: [
                    {
                        role: 'user',
                        text: 'Nome informado: Requeima\nPlanta: Tomate',
                    },
                ],
            }),
        );
    });

    it('should fail when the parsed response is incomplete', async () => {
        geminiClient.generateContent.mockResolvedValue(
            JSON.stringify({ diagnostico: 'diag' }),
        );

        const result = await service.getHandling('Requeima', 'Tomate');

        expect(result.isFailure()).toBe(true);
    });

    it('should fail when Gemini throws', async () => {
        geminiClient.generateContent.mockRejectedValue(
            new Error('timeout'),
        );

        const result = await service.getHandling('Requeima', 'Tomate');

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toBe('timeout');
    });

    it('should fail when the response is not valid JSON', async () => {
        geminiClient.generateContent.mockResolvedValue('not-json');

        const result = await service.getHandling('Requeima', 'Tomate');

        expect(result.isFailure()).toBe(true);
    });
});
