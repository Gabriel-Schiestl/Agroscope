import { SicknessModel } from '../Sickness.model';

describe('SicknessModel', () => {
    describe('climateConditions', () => {
        it('should treat NULL columns as undefined instead of 0', () => {
            const model = new SicknessModel();
            Object.assign(model, {
                temperatureMin: '20.00',
                temperatureMax: null,
                temperatureOptimal: null,
                humidityMin: '80.00',
                humidityMax: null,
                rainfallDependency: null,
                favorableSeasons: null,
            });

            expect(model.climateConditions).toEqual({
                temperatureMin: 20,
                temperatureMax: undefined,
                temperatureOptimal: undefined,
                humidityMin: 80,
                humidityMax: undefined,
                rainfallDependency: undefined,
                favorableSeasons: undefined,
            });
        });

        it('should return undefined when every climate column is NULL', () => {
            const model = new SicknessModel();
            Object.assign(model, {
                temperatureMin: null,
                temperatureMax: null,
                temperatureOptimal: null,
                humidityMin: null,
                humidityMax: null,
                rainfallDependency: null,
                favorableSeasons: null,
            });

            expect(model.climateConditions).toBeUndefined();
        });
    });
});
