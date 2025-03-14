export interface AddressProps {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    latitude?: number;
    longitude?: number;
}

export class Address implements AddressProps {
    #street: string;
    #number: string;
    #district: string;
    #city: string;
    #state: string;
    #zipCode: string;
    #complement?: string;
    #latitude?: number;
    #longitude?: number;

    private constructor(props: AddressProps) {
        this.#street = props.street;
        this.#number = props.number;
        this.#district = props.district;
        this.#city = props.city;
        this.#state = props.state;
        this.#zipCode = props.zipCode;
        this.#complement = props.complement;
        this.#latitude = props.latitude;
        this.#longitude = props.longitude;
    }

    static create(props: AddressProps): Address {
        return new Address(props);
    }

    get street() {
        return this.#street;
    }

    get number() {
        return this.#number;
    }

    get district() {
        return this.#district;
    }

    get city() {
        return this.#city;
    }

    get state() {
        return this.#state;
    }

    get zipCode() {
        return this.#zipCode;
    }

    get complement() {
        return this.#complement;
    }

    get latitude() {
        return this.#latitude;
    }

    get longitude() {
        return this.#longitude;
    }
}
