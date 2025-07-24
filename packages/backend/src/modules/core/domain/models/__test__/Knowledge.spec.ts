import { Knowledge } from '../Knowledge';

describe('Knowledge Domain', () => {
    const validProps = {
        sicknessId: 'sick-1',
        handling: 'Pulverização',
    };

    it('should create a knowledge successfully', () => {
        const knowledge = Knowledge.create(validProps);
        expect(knowledge).toBeInstanceOf(Knowledge);
        expect(knowledge.sicknessId).toBe(validProps.sicknessId);
        expect(knowledge.handling).toBe(validProps.handling);
    });

    it('should load a knowledge with given id', () => {
        const knowledge = Knowledge.load(validProps, 'custom-id');
        expect(knowledge).toBeInstanceOf(Knowledge);
        expect(knowledge.sicknessId).toBe(validProps.sicknessId);
        expect(knowledge.handling).toBe(validProps.handling);
        expect(knowledge.id).toBe('custom-id');
    });

    it('should change handling', () => {
        const knowledge = Knowledge.create(validProps);
        knowledge.changeHandling('Nova ação');
        expect(knowledge.handling).toBe('Nova ação');
    });

    it('should identify a Knowledge instance', () => {
        const knowledge = Knowledge.create(validProps);
        expect(Knowledge.isKnowledge(knowledge)).toBe(true);
        expect(Knowledge.isKnowledge({})).toBe(false);
    });
});
