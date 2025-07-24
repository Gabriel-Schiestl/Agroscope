import { Sickness } from '../Sickness';

describe('Sickness Domain', () => {
    const validProps = {
        name: 'Ferrugem',
        description: 'Doença fúngica',
        symptoms: ['manchas', 'amarelamento'],
    };

    it('should create a sickness successfully', () => {
        const sickness = Sickness.create(validProps);
        expect(sickness).toBeInstanceOf(Sickness);
        expect(sickness.name).toBe(validProps.name);
        expect(sickness.description).toBe(validProps.description);
        expect(sickness.symptoms).toEqual(validProps.symptoms);
    });

    it('should load a sickness with given id', () => {
        const sickness = Sickness.load(validProps, 'custom-id');
        expect(sickness).toBeInstanceOf(Sickness);
        expect(sickness.id).toBe('custom-id');
    });

    it('should identify a Sickness instance', () => {
        const sickness = Sickness.create(validProps);
        expect(Sickness.isSickness(sickness)).toBe(true);
        expect(Sickness.isSickness({})).toBe(false);
    });
});
