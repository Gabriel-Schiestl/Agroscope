import { AiAgentPayload } from '../../../domain/services/AiAgent.service';
import { MockAiAgentService } from '../MockAiAgent.service';

describe('MockAiAgentService', () => {
    let service: MockAiAgentService;

    const basePayload: AiAgentPayload = {
        message: '',
        userId: 'user-1',
        sessionId: 'session-1',
        history: [],
    };

    const analysisContext = {
        crop: 'Milho',
        cropConfidence: 0.9,
        sickness: 'Ferrugem',
        sicknessConfidence: 0.8,
        explanation: 'A ferrugem é uma doença fúngica.',
        causes: 'Alta umidade e temperaturas amenas.',
        handling: 'Aplique fungicida à base de cobre.',
        precautions: 'Evite irrigação por aspersão.',
    };

    beforeEach(() => {
        jest.useFakeTimers();
        service = new MockAiAgentService();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const send = async (payload: AiAgentPayload) => {
        const promise = service.sendMessage(payload);
        await jest.advanceTimersByTimeAsync(1000);
        return promise;
    };

    it('should ask for an analysis when none is associated with the conversation', async () => {
        const result = await send({ ...basePayload, message: 'Oi' });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toContain(
            'Ainda não encontrei uma análise',
        );
    });

    it('should answer about causes when asked, accent-insensitively', async () => {
        const result = await send({
            ...basePayload,
            message: 'Qual a causa disso?',
            analysisContext,
        });

        expect(result.isSuccess() && result.value).toContain(
            analysisContext.causes,
        );
    });

    it('should answer about handling when asked', async () => {
        const result = await send({
            ...basePayload,
            message: 'Como faço o tratamento?',
            analysisContext,
        });

        expect(result.isSuccess() && result.value).toContain(
            analysisContext.handling,
        );
    });

    it('should answer about precautions when asked', async () => {
        const result = await send({
            ...basePayload,
            message: 'Como posso evitar isso no futuro?',
            analysisContext,
        });

        expect(result.isSuccess() && result.value).toContain(
            analysisContext.precautions,
        );
    });

    it('should answer about the diagnosis when asked', async () => {
        const result = await send({
            ...basePayload,
            message: 'O que é essa doença?',
            analysisContext,
        });

        expect(result.isSuccess() && result.value).toContain(
            analysisContext.explanation,
        );
    });

    it('should fall back to a generic summary for unrecognized questions', async () => {
        const result = await send({
            ...basePayload,
            message: 'blablabla',
            analysisContext,
        });

        expect(result.isSuccess() && result.value).toContain('Milho');
        expect(result.isSuccess() && result.value).toContain('Ferrugem');
    });

    it('should report missing causes when there are none registered', async () => {
        const result = await send({
            ...basePayload,
            message: 'qual a causa?',
            analysisContext: { ...analysisContext, causes: undefined },
        });

        expect(result.isSuccess() && result.value).toContain(
            'Não há causas registradas',
        );
    });
});
