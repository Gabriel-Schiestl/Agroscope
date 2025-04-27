import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';
import { Address } from './Address';
import { Visit } from './Visit';

export enum PersonType {
    CPF = 'PF',
    CNPJ = 'PJ',
}

export enum Crop {
    SOYBEAN = 'SOJA',
    CORN = 'MILHO',
    WHEAT = 'TRIGO',
}

export interface ClientProps {
    name: string;
    telephone: string;
    person: PersonType;
    document: string;
    address: Address;
    totalArea: number;
    totalAreaPlanted: number;
    actualCrop?: Crop;
    active: boolean;
    createdAt?: Date;
}

export type CreateClientProps = Omit<
    ClientProps,
    'visits' | 'active' | 'createdAt'
>;
export interface LoadClientProps extends ClientProps {}

export class Client implements ClientProps {
    #id: string;
    #name: string;
    #telephone: string;
    #person: PersonType;
    #document: string;
    #address: Address;
    #totalArea: number;
    #totalAreaPlanted: number;
    #active: boolean = true;
    #actualCrop?: Crop;
    #createdAt?: Date;

    private constructor(props: ClientProps, id?: string) {
        this.#id = id || uuid();
        this.#name = props.name;
        this.#telephone = props.telephone;
        this.#person = props.person;
        this.#document = props.document;
        this.#address = props.address;
        this.#totalArea = props.totalArea;
        this.#totalAreaPlanted = props.totalAreaPlanted;
        this.#active = props.active;
        this.#actualCrop = props.actualCrop;
    }

    static create(props: CreateClientProps): Result<BusinessException, Client> {
        if (!props.name)
            return Res.failure(new BusinessException('Name is required'));

        if (!props.telephone)
            return Res.failure(new BusinessException('Telephone is required'));

        if (!props.person)
            return Res.failure(new BusinessException('Person is required'));

        if (!props.document)
            return Res.failure(new BusinessException('Document is required'));

        if (!props.address)
            return Res.failure(new BusinessException('Address is required'));

        if (!props.totalArea)
            return Res.failure(new BusinessException('Total area is required'));

        if (!props.totalAreaPlanted)
            return Res.failure(
                new BusinessException('Total area planted is required'),
            );

        return Res.success(new Client({ ...props, active: true }));
    }

    static load(props: LoadClientProps, id: string): Client {
        return new Client(props, id);
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get telephone() {
        return this.#telephone;
    }

    get person() {
        return this.#person;
    }

    get document() {
        return this.#document;
    }

    get address() {
        return this.#address;
    }

    get totalArea() {
        return this.#totalArea;
    }

    get totalAreaPlanted() {
        return this.#totalAreaPlanted;
    }

    get active() {
        return this.#active;
    }

    get actualCrop() {
        return this.#actualCrop;
    }

    get createdAt() {
        return this.#createdAt;
    }
}
