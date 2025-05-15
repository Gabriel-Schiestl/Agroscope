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
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    latitude?: number;
    longitude?: number;

    private constructor(props: AddressProps) {
        this.street = props.street;
        this.number = props.number;
        this.district = props.district;
        this.city = props.city;
        this.state = props.state;
        this.zipCode = props.zipCode;
        this.complement = props.complement;
        this.latitude = props.latitude;
        this.longitude = props.longitude;
    }

    static create(props: AddressProps): Address {
        return new Address(props);
    }
}
