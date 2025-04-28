import { Client } from '../../domain/models/Client';
import { Visit } from '../../domain/models/Visit';
import { ClientDto } from '../dto/Client.dto';
import { VisitAppMapper } from './Visit.mapper';

export interface ClientAppMapperProps extends Client {
    visits?: Visit[];
}

export class ClientAppMapper {
    static toDto(client: ClientAppMapperProps): ClientDto {
        return {
            id: client.id,
            name: client.name,
            address: client.address,
            person: client.person,
            document: client.document,
            telephone: client.telephone,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
            active: client.active,
            actualCrop: client.actualCrop,
            visits: client.visits
                ? client.visits.map((visit) => VisitAppMapper.toDto(visit))
                : [],
            createdAt: client.createdAt,
        };
    }
}
