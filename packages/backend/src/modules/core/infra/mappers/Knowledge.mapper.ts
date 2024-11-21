import { Knowledge } from '../../domain/models/Knowledge';
import { KnowledgeModel } from '../models/Knowledge.model';

export class KnowledgeMapper {
  static domainToModel(domain: Knowledge): KnowledgeModel {
    return new KnowledgeModel().setProps({
      id: domain.id,
      sicknessId: domain.sicknessId,
      handling: domain.handling,
    });
  }

  static modelToDomain(model: KnowledgeModel): Knowledge {
    return Knowledge.load(
      {
        sicknessId: model.sicknessId,
        handling: model.handling,
      },
      model.id,
    );
  }
}
