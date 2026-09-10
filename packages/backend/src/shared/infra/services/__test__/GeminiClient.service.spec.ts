const generateContentMock = jest.fn();

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: { generateContent: generateContentMock },
    })),
}));

import { GeminiClientServiceImpl } from '../GeminiClient.service';

describe('GeminiClientServiceImpl', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should throw when GEMINI_API_KEY is not configured', async () => {
        delete process.env.GEMINI_API_KEY;
        const service = new GeminiClientServiceImpl();

        await expect(
            service.generateContent({ contents: [{ role: 'user', text: 'oi' }] }),
        ).rejects.toThrow('GEMINI_API_KEY não configurado');
    });

    it('should return the generated text on success', async () => {
        process.env.GEMINI_API_KEY = 'fake-key';
        generateContentMock.mockResolvedValue({ text: 'resposta gerada' });

        const service = new GeminiClientServiceImpl();
        const result = await service.generateContent({
            systemInstruction: 'seja objetivo',
            contents: [{ role: 'user', text: 'oi' }],
            responseSchema: { type: 'object' },
        });

        expect(result).toBe('resposta gerada');
        expect(generateContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: 'oi' }] }],
                config: expect.objectContaining({
                    systemInstruction: 'seja objetivo',
                    responseMimeType: 'application/json',
                    responseSchema: { type: 'object' },
                }),
            }),
        );
    });

    it('should throw when the response text is empty', async () => {
        process.env.GEMINI_API_KEY = 'fake-key';
        generateContentMock.mockResolvedValue({ text: '' });

        const service = new GeminiClientServiceImpl();

        await expect(
            service.generateContent({ contents: [{ role: 'user', text: 'oi' }] }),
        ).rejects.toThrow('Resposta vazia do Gemini');
    });

    it('should throw on timeout', async () => {
        process.env.GEMINI_API_KEY = 'fake-key';
        process.env.GEMINI_TIMEOUT_MS = '10';
        generateContentMock.mockReturnValue(
            new Promise((resolve) =>
                setTimeout(() => resolve({ text: 'tarde demais' }), 100),
            ),
        );

        const service = new GeminiClientServiceImpl();

        await expect(
            service.generateContent({ contents: [{ role: 'user', text: 'oi' }] }),
        ).rejects.toThrow('Gemini timeout após 10ms');
    });
});
