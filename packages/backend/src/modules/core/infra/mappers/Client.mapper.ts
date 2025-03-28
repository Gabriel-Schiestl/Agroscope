import { Address } from '../../domain/models/Address';
import { Client } from '../../domain/models/Client';
import { ClientModel } from '../models/Client.model';
import { HistoryMapper } from './History.mapper';

export class ClientMapper {
    static domainToModel(client: Client): ClientModel {
        return new ClientModel().setProps({
            name: client.name,
            telephone: client.telephone,
            predictions: client.predictions
                ? client.predictions.map((prediction) =>
                      HistoryMapper.domainToModel(prediction),
                  )
                : [],
            person: client.person,
            document: client.document,
            address: client.address,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
        });
    }

    static modelToDomain(client: ClientModel): Client {
        return Client.load(
            {
                name: client.name,
                telephone: client.telephone,
                predictions: client.predictions
                    ? client.predictions.map((prediction) =>
                          HistoryMapper.modelToDomain(prediction),
                      )
                    : [],
                person: client.person,
                document: client.document,
                address: Address.create(client.address),
                totalArea: client.totalArea,
                totalAreaPlanted: client.totalAreaPlanted,
            },
            client.id,
        );
    }
}
