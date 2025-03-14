import { Client } from '../../domain/models/Client';
import { ClientDto } from '../dto/Client.dto';
import { HistoryAppMapper } from './History.mapper';

export class ClientAppMapper {
    static toDto(client: Client): ClientDto {
        return {
            id: client.id,
            name: client.name,
            predictions: client.predictions
                ? client.predictions.map((prediction) =>
                      HistoryAppMapper.toDto(prediction),
                  )
                : [],
            address: client.address,
            person: client.person,
            document: client.document,
            telephone: client.telephone,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
        };
    }
}
