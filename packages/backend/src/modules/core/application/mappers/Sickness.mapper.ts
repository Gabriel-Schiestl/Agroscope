import { Sickness } from '../../domain/models/Sickness';
import { SicknessDto } from '../dto/Sickness.dto';

export class SicknessAppMapper {
    static toDto(sickness: Sickness): SicknessDto {
        const cc = sickness.climateConditions;

        return {
            id: sickness.id,
            name: sickness.name,
            description: sickness.description,
            symptoms: sickness.symptoms,
            climateConditions: cc
                ? {
                      temperatureMin: cc.temperatureMin,
                      temperatureMax: cc.temperatureMax,
                      temperatureOptimal: cc.temperatureOptimal,
                      humidityMin: cc.humidityMin,
                      humidityMax: cc.humidityMax,
                      rainfallDependency: cc.rainfallDependency,
                      favorableSeasons: cc.favorableSeasons,
                  }
                : undefined,
        };
    }
}
