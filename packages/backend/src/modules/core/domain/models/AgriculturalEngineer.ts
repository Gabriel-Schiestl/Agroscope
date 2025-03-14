import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';
import { Client } from './Client';

export interface AgriculturalEngineerProps {
    userId: string;
    clients?: Client[];
}

export type CreateAgriculturalEngineerProps = Omit<
    AgriculturalEngineerProps,
    'clients'
>;
export interface LoadAgriculturalEngineerProps
    extends AgriculturalEngineerProps {}

export class AgriculturalEngineer implements AgriculturalEngineerProps {
    #id: string;
    #userId: string;
    #clients?: Client[];

    private constructor(props: AgriculturalEngineerProps, id?: string) {
        this.#id = id || uuid();
        this.#userId = props.userId;
        this.#clients = props.clients;
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

    get id() {
        return this.#id;
    }

    get userId() {
        return this.#userId;
    }

    get clients() {
        return this.#clients;
    }
}
