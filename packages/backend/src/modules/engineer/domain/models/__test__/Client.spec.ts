import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Address } from '../Address';
import { Client, PersonType } from '../Client';

describe('Client', () => {
    const address = Address.create({
        street: 'Rua 1',
        number: '100',
        district: 'Centro',
        city: 'Cidade',
        state: 'UF',
        zipCode: '12345-678',
    });
    const validProps = {
        name: 'Cliente Teste',
        telephone: '11999999999',
        email: 'cliente@teste.com',
        person: PersonType.CPF,
        document: '123.456.789-00',
        address,
        totalArea: 100,
        totalAreaPlanted: 80,
    };

    it('should create a valid Client', () => {
        const result = Client.create(validProps);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.name).toBe(validProps.name);
            expect(result.value.address).toBe(address);
            expect(result.value.active).toBe(true);
        }
    });

    it('should fail to create without name', () => {
        const result = Client.create({ ...validProps, name: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without telephone', () => {
        const result = Client.create({ ...validProps, telephone: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without person', () => {
        const result = Client.create({ ...validProps, person: undefined });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without document', () => {
        const result = Client.create({ ...validProps, document: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without address', () => {
        const result = Client.create({ ...validProps, address: undefined });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without totalArea', () => {
        const result = Client.create({ ...validProps, totalArea: undefined });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without totalAreaPlanted', () => {
        const result = Client.create({
            ...validProps,
            totalAreaPlanted: undefined,
        });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should fail to create without email', () => {
        const result = Client.create({ ...validProps, email: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });
});
