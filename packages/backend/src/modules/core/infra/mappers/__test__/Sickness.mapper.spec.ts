import { Sickness } from '../../../domain/models/Sickness';
import { SicknessModel } from '../../models/Sickness.model';
import { SicknessMapper } from '../Sickness.mapper';

describe('SicknessMapper', () => {
    it('should map a Sickness domain entity to a SicknessModel', () => {
        const sickness = Sickness.load(
            {
                name: 'Ferrugem',
                description: 'Doença fúngica',
                symptoms: ['manchas'],
                climateConditions: {
                    temperatureMin: 20,
                    temperatureMax: 30,
                    rainfallDependency: 'high',
                    favorableSeasons: ['spring'],
                },
            },
            'sickness-1',
        );

        const model = SicknessMapper.domainToModel(sickness);

        expect(model).toBeInstanceOf(SicknessModel);
        expect(model.id).toBe('sickness-1');
        expect(model.name).toBe('Ferrugem');
        expect(model.temperatureMin).toBe(20);
        expect(model.temperatureMax).toBe(30);
        expect(model.rainfallDependency).toBe('high');
        expect(model.favorableSeasons).toEqual(['spring']);
    });

    it('should map a SicknessModel without climate data back to a domain entity with undefined climateConditions', () => {
        const model = new SicknessModel().setProps({
            id: 'sickness-2',
            name: 'Ferrugem',
            symptoms: ['manchas'],
        });

        const sickness = SicknessMapper.modelToDomain(model);

        expect(sickness).toBeInstanceOf(Sickness);
        expect(sickness.id).toBe('sickness-2');
        expect(sickness.climateConditions).toBeUndefined();
    });

    it('should map a SicknessModel with climate data back to a domain entity with climateConditions', () => {
        const model = new SicknessModel().setProps({
            id: 'sickness-3',
            name: 'Ferrugem',
            symptoms: ['manchas'],
            temperatureMin: 20,
            temperatureMax: 30,
        });

        const sickness = SicknessMapper.modelToDomain(model);

        expect(sickness.climateConditions?.temperatureMin).toBe(20);
        expect(sickness.climateConditions?.temperatureMax).toBe(30);
    });
});
