import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent, CreateCalendarEventProps } from './CalendarEvent';

export interface CalendarProps {
    userId: string;
    name?: string;
    events: CalendarEvent[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateCalendarProps
    extends Omit<CalendarProps, 'events' | 'createdAt' | 'updatedAt'> {}

export interface LoadCalendarProps extends CalendarProps {}

export class Calendar implements CalendarProps {
    #id: string;
    #userId: string;
    #name?: string;
    #events: CalendarEvent[];
    #createdAt: Date;
    #updatedAt: Date;

    private constructor(props: CalendarProps, id?: string) {
        this.#id = id ?? uuidv4();
        this.#userId = props.userId;
        this.#name = props.name || 'Calendário';
        this.#events = props.events;
        this.#createdAt = new Date();
        this.#updatedAt = new Date();
    }

    static create(
        props: CreateCalendarProps,
    ): Result<BusinessException, Calendar> {
        if (!props.userId) {
            return Res.failure(new BusinessException('User ID is required'));
        }

        return Res.success(new Calendar({ ...props, events: [] }));
    }

    static load(props: LoadCalendarProps, id: string): Calendar {
        const calendar = new Calendar(props, id);

        return calendar;
    }

    /**
     * Adiciona um evento ao calendário
     */
    addEvent(
        eventProps: CreateCalendarEventProps,
    ): Result<BusinessException, void> {
        const event = CalendarEvent.create(eventProps);
        if (event.isFailure()) {
            return Res.failure(event.error);
        }

        this.#events.push(event.value);
        this.#updatedAt = new Date();
        return Res.success();
    }

    /**
     * Remove um evento do calendário
     */
    removeEvent(eventId: string): Result<BusinessException, void> {
        const initialLength = this.#events.length;
        this.#events = this.#events.filter((event) => event.id !== eventId);

        if (this.#events.length !== initialLength) {
            this.#updatedAt = new Date();
            return Res.success();
        }

        return Res.failure(new BusinessException('Event not found'));
    }

    /**
     * Atualiza um evento existente
     */
    updateEvent(
        eventId: string,
        eventProps: Partial<Omit<CreateCalendarEventProps, 'id' | 'createdAt'>>,
    ): Result<BusinessException, CalendarEvent> {
        const event = this.#events.find((e) => e.id === eventId);

        if (!event) {
            return Res.failure(new BusinessException('Event not found'));
        }

        event.update(eventProps);
        this.#updatedAt = new Date();

        return Res.success(event);
    }

    /**
     * Obter todos os eventos
     */
    getAllEvents(): CalendarEvent[] {
        return [...this.#events];
    }

    /**
     * Obter eventos em um intervalo de datas
     */
    getEventsInRange(startDate: Date, endDate: Date): CalendarEvent[] {
        return this.#events.filter((event) => {
            const eventDate = event.date;
            return eventDate >= startDate && eventDate <= endDate;
        });
    }

    /**
     * Obter eventos em uma data específica
     */
    getEventsOnDate(date: Date): CalendarEvent[] {
        return this.#events.filter((event) => {
            const eventDate = event.date;
            return (
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
            );
        });
    }

    /**
     * Obter eventos por tipo
     */
    getEventsByType(type: string): CalendarEvent[] {
        return this.#events.filter((event) => event.type === type);
    }

    /**
     * Obter eventos por cliente
     */
    getEventsByClient(clientId: string): CalendarEvent[] {
        return this.#events.filter((event) => event.clientId === clientId);
    }

    /**
     * Atualiza o nome do calendário
     */
    updateName(name: string): void {
        this.#name = name;
        this.#updatedAt = new Date();
    }

    get id(): string {
        return this.#id;
    }

    get userId(): string {
        return this.#userId;
    }

    get name(): string | undefined {
        return this.#name;
    }

    get events(): CalendarEvent[] {
        return [...this.#events];
    }

    get createdAt(): Date {
        return this.#createdAt;
    }

    get updatedAt(): Date {
        return this.#updatedAt;
    }
}
