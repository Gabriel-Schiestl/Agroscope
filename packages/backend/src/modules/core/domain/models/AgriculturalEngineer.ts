import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';
import { Calendar } from './Calendar';
import { Client, CreateClientProps } from './Client';

export interface AgriculturalEngineerProps {
    userId: string;
    clients?: Client[];
    calendar?: Calendar;
}

export type CreateAgriculturalEngineerProps = Omit<
    AgriculturalEngineerProps,
    'clients' | 'calendar'
>;
export interface LoadAgriculturalEngineerProps
    extends AgriculturalEngineerProps {}

export class AgriculturalEngineer implements AgriculturalEngineerProps {
    #id: string;
    #userId: string;
    #clients?: Client[];
    #calendar?: Calendar;

    private constructor(props: AgriculturalEngineerProps, id?: string) {
        this.#id = id || uuid();
        this.#userId = props.userId;
        this.#clients = props.clients;
        this.#calendar = props.calendar;
    }

    static create(
        props: CreateAgriculturalEngineerProps,
    ): Result<BusinessException, AgriculturalEngineer> {
        if (!props.userId)
            return Res.failure(new BusinessException('User ID is required'));

        return Res.success(new AgriculturalEngineer(props));
    }

    static load(
        props: LoadAgriculturalEngineerProps,
        id: string,
    ): AgriculturalEngineer {
        return new AgriculturalEngineer(props, id);
    }

    addClient(props: CreateClientProps): Result<BusinessException, Client> {
        if (!this.#clients) this.#clients = [];

        const clientOrError = Client.create(props);
        if (clientOrError.isFailure()) return Res.failure(clientOrError.error);

        this.#clients.push(clientOrError.value);
        return Res.success(clientOrError.value);
    }

    setCalendar(calendar: Calendar): void {
        this.#calendar = calendar;
    }

    get id() {
        return this.#id;
    }

    get userId() {
        return this.#userId;
    }

    get clients() {
        return this.#clients;
    }

    get calendar() {
        return this.#calendar;
    }
}
