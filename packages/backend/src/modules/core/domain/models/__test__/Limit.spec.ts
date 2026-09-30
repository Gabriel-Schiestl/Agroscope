import { Limit } from '../Limit';

describe('Limit Domain', () => {
    it('should create a limit with zeroed counters', () => {
        const limit = Limit.create();

        expect(limit).toBeInstanceOf(Limit);
        expect(limit.imageRequests).toBe(0);
        expect(limit.chatRequests).toBe(0);
        expect(limit.id).toBeDefined();
    });

    it('should load a limit with given id and props', () => {
        const lastAnalysis = new Date('2026-01-01');
        const lastMessage = new Date('2026-01-02');

        const limit = Limit.load(
            {
                imageRequests: 3,
                chatRequests: 5,
                lastAnalysis,
                lastMessage,
            },
            'limit-1',
        );

        expect(limit.id).toBe('limit-1');
        expect(limit.imageRequests).toBe(3);
        expect(limit.chatRequests).toBe(5);
        expect(limit.lastAnalysis).toBe(lastAnalysis);
        expect(limit.lastMessage).toBe(lastMessage);
    });

    it('should increment image requests', () => {
        const limit = Limit.create();
        limit.incrementImageRequests();
        limit.incrementImageRequests();
        expect(limit.imageRequests).toBe(2);
    });

    it('should increment chat requests', () => {
        const limit = Limit.create();
        limit.incrementChatRequests();
        expect(limit.chatRequests).toBe(1);
    });

    it('should set last analysis and last message dates', () => {
        const limit = Limit.create();
        const analysisDate = new Date('2026-02-01');
        const messageDate = new Date('2026-02-02');

        limit.setLastAnalysis(analysisDate);
        limit.setLastMessage(messageDate);

        expect(limit.lastAnalysis).toBe(analysisDate);
        expect(limit.lastMessage).toBe(messageDate);
    });
});
