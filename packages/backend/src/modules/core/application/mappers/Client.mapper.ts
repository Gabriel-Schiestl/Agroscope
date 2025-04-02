import { Client } from '../../domain/models/Client';
import { ClientDto } from '../dto/Client.dto';

export class ClientAppMapper {
    static toDto(client: Client): ClientDto {
        return {
            id: client.id,
            name: client.name,
            address: client.address,
            person: client.person,
            document: client.document,
            telephone: client.telephone,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
        };
    }
}
