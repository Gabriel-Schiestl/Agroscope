import { Address } from '../../domain/models/Address';
import { Client } from '../../domain/models/Client';
import { ClientModel } from '../models/Client.model';

export class ClientMapper {
    static domainToModel(client: Client): ClientModel {
        return new ClientModel().setProps({
            name: client.name,
            telephone: client.telephone,
            email: client.email,
            person: client.person,
            document: client.document,
            address: client.address,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
            active: client.active,
            actualCrop: client.actualCrop,
            createdAt: client.createdAt,
        });
    }

    static modelToDomain(client: ClientModel): Client {
        return Client.load(
            {
                name: client.name,
                telephone: client.telephone,
                email: client.email,
                person: client.person,
                document: client.document,
                address: Address.create(client.address),
                totalArea: client.totalArea,
                totalAreaPlanted: client.totalAreaPlanted,
                active: client.active,
                actualCrop: client.actualCrop,
                createdAt: client.createdAt,
            },
            client.id,
        );
    }
}
