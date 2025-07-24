import { Address } from '../Address';

describe('Address', () => {
    const props = {
        street: 'Rua 1',
        number: '100',
        district: 'Centro',
        city: 'Cidade',
        state: 'UF',
        zipCode: '12345-678',
        complement: 'Apto 1',
        latitude: -23.5,
        longitude: -46.6,
    };

    it('should create a valid Address', () => {
        const address = Address.create(props);
        expect(address.street).toBe(props.street);
        expect(address.number).toBe(props.number);
        expect(address.district).toBe(props.district);
        expect(address.city).toBe(props.city);
        expect(address.state).toBe(props.state);
        expect(address.zipCode).toBe(props.zipCode);
        expect(address.complement).toBe(props.complement);
        expect(address.latitude).toBe(props.latitude);
        expect(address.longitude).toBe(props.longitude);
    });
});
