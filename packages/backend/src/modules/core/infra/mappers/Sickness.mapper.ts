import { Sickness } from '../../domain/models/Sickness';
import { SicknessModel } from '../models/Sickness.model';

export class SicknessMapper {
    static domainToModel(sickness: Sickness): SicknessModel {
        const cc = sickness.climateConditions;

        return new SicknessModel().setProps({
            id: sickness.id,
            name: sickness.name,
            description: sickness.description,
            symptoms: sickness.symptoms,
            temperatureMin: cc?.temperatureMin,
            temperatureMax: cc?.temperatureMax,
            temperatureOptimal: cc?.temperatureOptimal,
            humidityMin: cc?.humidityMin,
            humidityMax: cc?.humidityMax,
            rainfallDependency: cc?.rainfallDependency,
            favorableSeasons: cc?.favorableSeasons,
        });
    }

    static modelToDomain(model: SicknessModel): Sickness {
        return Sickness.load(
            {
                name: model.name,
                description: model.description,
                symptoms: model.symptoms,
                climateConditions: model.climateConditions,
            },
            model.id,
        );
    }
}
