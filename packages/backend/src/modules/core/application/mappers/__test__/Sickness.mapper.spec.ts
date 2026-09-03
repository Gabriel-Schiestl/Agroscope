import { Sickness } from '../../../domain/models/Sickness';
import { SicknessAppMapper } from '../Sickness.mapper';

describe('SicknessAppMapper', () => {
    it('should map a Sickness domain entity to a SicknessDto including climate conditions', () => {
        const sickness = Sickness.load(
            {
                name: 'Ferrugem',
                description: 'Doença fúngica',
                symptoms: ['manchas'],
                climateConditions: {
                    temperatureMin: 20,
                    temperatureMax: 30,
                    temperatureOptimal: 25,
                    humidityMin: 60,
                    humidityMax: 90,
                    rainfallDependency: 'high',
                    favorableSeasons: ['spring'],
                },
            },
            'sickness-1',
        );

        const dto = SicknessAppMapper.toDto(sickness);

        expect(dto).toEqual({
            id: 'sickness-1',
            name: 'Ferrugem',
            description: 'Doença fúngica',
            symptoms: ['manchas'],
            climateConditions: {
                temperatureMin: 20,
                temperatureMax: 30,
                temperatureOptimal: 25,
                humidityMin: 60,
                humidityMax: 90,
                rainfallDependency: 'high',
                favorableSeasons: ['spring'],
            },
        });
    });

    it('should omit climateConditions when the sickness has none', () => {
        const sickness = Sickness.load(
            { name: 'Ferrugem', symptoms: ['manchas'] },
            'sickness-2',
        );

        const dto = SicknessAppMapper.toDto(sickness);

        expect(dto.climateConditions).toBeUndefined();
    });
});
