import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Calendar } from '../Calendar';
import { EventType } from '../CalendarEvent';

describe('Calendar', () => {
    const userId = 'user-1';
    const eventProps = {
        title: 'Reunião',
        type: EventType.MEETING,
        date: new Date('2025-07-24T10:00:00Z'),
        time: '10:00',
        clientId: 'client-1',
    };

    it('should create a calendar', () => {
        const result = Calendar.create({ userId });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.userId).toBe(userId);
            expect(result.value.events).toHaveLength(0);
        }
    });

    it('should fail to create calendar without userId', () => {
        const result = Calendar.create({ userId: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should add an event', () => {
        let calendarResult = Calendar.create({ userId });
        let calendar: Calendar;
        if (calendarResult.isSuccess()) {
            calendar = calendarResult.value;
        }
        const addResult = calendar.addEvent(eventProps);
        expect(addResult.isSuccess()).toBe(true);
        expect(calendar.events).toHaveLength(1);
        expect(calendar.events[0].title).toBe('Reunião');
    });

    it('should not add invalid event', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        const addResult = calendarInstance.addEvent({
            ...eventProps,
            title: '',
        });
        expect(addResult.isFailure()).toBe(true);
        if (addResult.isFailure()) {
            expect(addResult.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should remove an event', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const eventId = calendarInstance.events[0].id;
        const removeResult = calendarInstance.removeEvent(eventId);
        expect(removeResult.isSuccess()).toBe(true);
        expect(calendarInstance.events).toHaveLength(0);
    });

    it('should fail to remove non-existent event', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        const removeResult = calendarInstance.removeEvent('not-exist');
        expect(removeResult.isFailure()).toBe(true);
        if (removeResult.isFailure()) {
            expect(removeResult.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should update an event', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const eventId = calendarInstance.events[0].id;
        const updateResult = calendarInstance.updateEvent(eventId, {
            title: 'Nova Reunião',
        });
        expect(updateResult.isSuccess()).toBe(true);
        expect(calendarInstance.events[0].title).toBe('Nova Reunião');
    });

    it('should fail to update non-existent event', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        const updateResult = calendarInstance.updateEvent('not-exist', {
            title: 'Teste',
        });
        expect(updateResult.isFailure()).toBe(true);
        if (updateResult.isFailure()) {
            expect(updateResult.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should get events in range', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const events = calendarInstance.getEventsInRange(
            new Date('2025-07-24T00:00:00Z'),
            new Date('2025-07-25T00:00:00Z'),
        );
        expect(events).toHaveLength(1);
    });

    it('should get events on date', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const events = calendarInstance.getEventsOnDate(
            new Date('2025-07-24T00:00:00Z'),
        );
        expect(events).toHaveLength(1);
    });

    it('should get events by type', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const events = calendarInstance.getEventsByType(EventType.MEETING);
        expect(events).toHaveLength(1);
    });

    it('should get events by client', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.addEvent(eventProps);
        const events = calendarInstance.getEventsByClient('client-1');
        expect(events).toHaveLength(1);
    });

    it('should update calendar name', () => {
        const calendar = Calendar.create({ userId });
        let calendarInstance: Calendar;
        if (calendar.isSuccess()) {
            calendarInstance = calendar.value;
        }
        calendarInstance.updateName('Novo Nome');
        expect(calendarInstance.name).toBe('Novo Nome');
    });
});
