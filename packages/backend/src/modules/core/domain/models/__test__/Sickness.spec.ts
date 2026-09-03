import { BusinessException } from 'src/shared/exceptions/Business.exception';
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
        expect(sickness.isSuccess() && sickness.value.name).toBe(validProps.name);
        expect(sickness.isSuccess() && sickness.value.description).toBe(validProps.description);
        expect(sickness.isSuccess() && sickness.value.symptoms).toEqual(validProps.symptoms);
    });

    it('should fail without a name', () => {
        const result = Sickness.create({ ...validProps, name: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail without symptoms', () => {
        const result = Sickness.create({ ...validProps, symptoms: [] });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should load a sickness with given id', () => {
        const sickness = Sickness.load(validProps, 'custom-id');
        expect(sickness).toBeInstanceOf(Sickness);
        expect(sickness.id).toBe('custom-id');
    });

    describe('isSickness', () => {
        it('should identify a Sickness instance', () => {
            const sickness = Sickness.load(validProps, 'id-1');
            expect(Sickness.isSickness(sickness)).toBe(true);
            expect(Sickness.isSickness({})).toBe(false);
        });
    });

    describe('ClimateConditions', () => {
        it('should create sickness with climate conditions', () => {
            const result = Sickness.create({
                ...validProps,
                climateConditions: {
                    temperatureMin: 20,
                    temperatureMax: 30,
                    temperatureOptimal: 25,
                    humidityMin: 60,
                    humidityMax: 90,
                    rainfallDependency: 'high',
                    favorableSeasons: ['spring', 'summer'],
                },
            });
            expect(result.isSuccess()).toBe(true);
            if (result.isSuccess()) {
                expect(result.value.climateConditions?.temperatureOptimal).toBe(25);
                expect(result.value.climateConditions?.rainfallDependency).toBe('high');
            }
        });

        it('should fail when temperatureMin > temperatureMax', () => {
            const result = Sickness.create({
                ...validProps,
                climateConditions: { temperatureMin: 35, temperatureMax: 20 },
            });
            expect(result.isFailure()).toBe(true);
        });

        it('should fail when humidityMin > humidityMax', () => {
            const result = Sickness.create({
                ...validProps,
                climateConditions: { humidityMin: 80, humidityMax: 40 },
            });
            expect(result.isFailure()).toBe(true);
        });

        it('should fail when humidity is out of 0-100 range', () => {
            const result = Sickness.create({
                ...validProps,
                climateConditions: { humidityMin: -5, humidityMax: 110 },
            });
            expect(result.isFailure()).toBe(true);
        });
    });

    describe('isCompatibleWithWeather', () => {
        const sickness = Sickness.load(
            {
                ...validProps,
                climateConditions: {
                    temperatureMin: 20,
                    temperatureMax: 30,
                    humidityMin: 60,
                    humidityMax: 90,
                    favorableSeasons: ['spring', 'summer'],
                },
            },
            'id-1',
        );

        it('should return true when weather is within ranges', () => {
            expect(
                sickness.isCompatibleWithWeather({
                    temperature: 25,
                    humidity: 75,
                    season: 'spring',
                }),
            ).toBe(true);
        });

        it('should return false when temperature is below minimum', () => {
            expect(
                sickness.isCompatibleWithWeather({ temperature: 15, humidity: 75 }),
            ).toBe(false);
        });

        it('should return false when temperature exceeds maximum', () => {
            expect(
                sickness.isCompatibleWithWeather({ temperature: 35, humidity: 75 }),
            ).toBe(false);
        });

        it('should return false when humidity is below minimum', () => {
            expect(
                sickness.isCompatibleWithWeather({ temperature: 25, humidity: 30 }),
            ).toBe(false);
        });

        it('should return false when humidity exceeds maximum', () => {
            expect(
                sickness.isCompatibleWithWeather({ temperature: 25, humidity: 95 }),
            ).toBe(false);
        });

        it('should return false when season is not favorable', () => {
            expect(
                sickness.isCompatibleWithWeather({
                    temperature: 25,
                    humidity: 75,
                    season: 'winter',
                }),
            ).toBe(false);
        });

        it('should return true when no climate conditions are defined', () => {
            const sicknessNoClimate = Sickness.load(validProps, 'id-2');
            expect(
                sicknessNoClimate.isCompatibleWithWeather({
                    temperature: 5,
                    humidity: 10,
                }),
            ).toBe(true);
        });

        it('should skip season check when season is not provided in weather data', () => {
            expect(
                sickness.isCompatibleWithWeather({ temperature: 25, humidity: 75 }),
            ).toBe(true);
        });
    });
});
