import { CalendarEvent, EventType, EventStatus } from '../CalendarEvent';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

describe('CalendarEvent', () => {
    const validProps = {
        title: 'Visita Técnica',
        type: EventType.VISIT,
        date: new Date('2025-07-24T09:00:00Z'),
        time: '09:00',
        clientId: 'client-1',
    };

    it('should create a valid CalendarEvent', () => {
        const result = CalendarEvent.create(validProps);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.title).toBe(validProps.title);
            expect(result.value.type).toBe(validProps.type);
            expect(result.value.status).toBe(EventStatus.PENDING);
            expect(result.value.clientId).toBe(validProps.clientId);
        }
    });

    it('should fail to create without title', () => {
        const result = CalendarEvent.create({ ...validProps, title: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without type', () => {
        const result = CalendarEvent.create({ ...validProps, type: undefined });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without date', () => {
        const result = CalendarEvent.create({ ...validProps, date: undefined });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without time', () => {
        const result = CalendarEvent.create({ ...validProps, time: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without clientId', () => {
        const result = CalendarEvent.create({ ...validProps, clientId: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should update event properties', () => {
        const result = CalendarEvent.create(validProps);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            const event = result.value;
            event.update({
                title: 'Nova Visita',
                location: 'Fazenda',
                description: 'Descrição',
            });
            expect(event.title).toBe('Nova Visita');
            expect(event.location).toBe('Fazenda');
            expect(event.description).toBe('Descrição');
        }
    });
});
