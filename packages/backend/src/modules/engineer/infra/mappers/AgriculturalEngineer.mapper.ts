import { AgriculturalEngineer } from '../../domain/models/AgriculturalEngineer';
import { AgriculturalEngineerModel } from '../models/AgriculturalEngineer.model';
import { ClientMapper } from './Client.mapper';

export class AgriculturalEngineerMapper {
    static domainToModel(
        agriculturalEngineer: AgriculturalEngineer,
    ): AgriculturalEngineerModel {
        return new AgriculturalEngineerModel().setProps({
            id: agriculturalEngineer.id,
            userId: agriculturalEngineer.userId,
            clients: agriculturalEngineer.clients
                ? agriculturalEngineer.clients.map((client) =>
                      ClientMapper.domainToModel(client),
                  )
                : [],
        });
    }

    static modelToDomain(
        agriculturalEngineerModel: AgriculturalEngineerModel,
    ): AgriculturalEngineer {
        return AgriculturalEngineer.load(
            {
                userId: agriculturalEngineerModel.userId,
                clients: agriculturalEngineerModel.clients
                    ? agriculturalEngineerModel.clients.map((client) =>
                          ClientMapper.modelToDomain(client),
                      )
                    : [],
            },
            agriculturalEngineerModel.id,
        );
    }
}
