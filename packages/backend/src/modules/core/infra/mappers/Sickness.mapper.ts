import { Sickness } from '../../domain/models/Sickness';
import { SicknessModel } from '../models/Sickness.model';

export class SicknessMapper {
  static domainToModel(sickness: Sickness): SicknessModel {
    return new SicknessModel().setProps({
      id: sickness.id,
      name: sickness.name,
      description: sickness.description,
      symptoms: sickness.symptoms,
    });
  }

  static modelToDomain(model: SicknessModel): Sickness {
    return Sickness.load(
      {
        name: model.name,
        description: model.description,
        symptoms: model.symptoms,
      },
      model.id,
    );
  }
}
