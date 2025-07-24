import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Address } from '../Address';
import { AgriculturalEngineer } from '../AgriculturalEngineer';
import { PersonType } from '../Client';

describe('AgriculturalEngineer', () => {
    const userId = 'user-1';
    const address = Address.create({
        street: 'Rua 1',
        number: '100',
        district: 'Centro',
        city: 'Cidade',
        state: 'UF',
        zipCode: '12345-678',
    });
    const clientProps = {
        name: 'Cliente Teste',
        telephone: '11999999999',
        email: 'cliente@teste.com',
        person: PersonType.CPF,
        document: '123.456.789-00',
        address,
        totalArea: 100,
        totalAreaPlanted: 80,
    };

    it('should create a valid AgriculturalEngineer', () => {
        const result = AgriculturalEngineer.create({ userId });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.userId).toBe(userId);
            expect(result.value.clients).toBeUndefined();
        }
    });

    it('should fail to create without userId', () => {
        const result = AgriculturalEngineer.create({ userId: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
        }
    });

    it('should add a client', () => {
        const result = AgriculturalEngineer.create({ userId });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            const engineer = result.value;
            const addResult = engineer.addClient(clientProps);
            expect(addResult.isSuccess()).toBe(true);
            if (addResult.isSuccess()) {
                expect(engineer.clients.length).toBe(1);
                expect(addResult.value.name).toBe(clientProps.name);
            }
        }
    });

    it('should not add invalid client', () => {
        const result = AgriculturalEngineer.create({ userId });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            const engineer = result.value;
            const addResult = engineer.addClient({ ...clientProps, name: '' });
            expect(addResult.isFailure()).toBe(true);
            if (addResult.isFailure()) {
                expect(addResult.error).toBeInstanceOf(BusinessException);
            }
        }
    });

    it('should set calendar', () => {
        const result = AgriculturalEngineer.create({ userId });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            const engineer = result.value;
            engineer.setCalendar('calendar-1');
            expect(engineer.calendar).toBe('calendar-1');
        }
    });
});
