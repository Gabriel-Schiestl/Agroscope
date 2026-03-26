import { Sickness } from '../Sickness';

describe('Sickness Domain', () => {
    const validProps = {
        name: 'Ferrugem',
        description: 'Doença fúngica',
        symptoms: ['manchas', 'amarelamento'],
    };

    it('should create a sickness successfully', () => {
        const sickness = Sickness.create(validProps);
        expect(sickness.isSuccess()).toBe(true);
        expect(sickness.isSuccess() && sickness.value).toBeInstanceOf(Sickness);
        expect(sickness.isSuccess() && sickness.value.name).toBe(
            validProps.name,
        );
        expect(sickness.isSuccess() && sickness.value.description).toBe(
            validProps.description,
        );
        expect(sickness.isSuccess() && sickness.value.symptoms).toEqual(
            validProps.symptoms,
        );
    });

    it('should load a sickness with given id', () => {
        const sickness = Sickness.load(validProps, 'custom-id');
        expect(sickness).toBeInstanceOf(Sickness);
        expect(sickness.id).toBe('custom-id');
    });
});
