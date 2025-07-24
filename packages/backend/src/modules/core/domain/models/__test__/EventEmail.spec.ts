import { EventEmail } from '../EventEmail';

describe('EventEmail Domain', () => {
    it('should create an EventEmail with all properties', () => {
        const props = {
            to: 'user@example.com',
            subject: 'Test Subject',
            templateId: 1,
            params: { name: 'John', code: 123 },
        };
        const email = new EventEmail(props);
        expect(email.to).toBe(props.to);
        expect(email.subject).toBe(props.subject);
        expect(email.templateId).toBe(props.templateId);
        expect(email.params).toEqual(props.params);
    });

    it('should create an EventEmail without params', () => {
        const props = {
            to: 'user@example.com',
            subject: 'No Params',
            templateId: 2,
        };
        const email = new EventEmail(props);
        expect(email.to).toBe(props.to);
        expect(email.subject).toBe(props.subject);
        expect(email.templateId).toBe(props.templateId);
        expect(email.params).toBeUndefined();
    });
});
