import { AgriculturalEngineer } from '../../domain/models/AgriculturalEngineer';
import { AgriculturalEngineerDto } from '../dto/AgriculturalEngineer.dto';
import { ClientAppMapper } from './Client.mapper';

export class AgriculturalEngineerAppMapper {
    static toDto(
        agriculturalEngineer: AgriculturalEngineer,
    ): AgriculturalEngineerDto {
        return {
            id: agriculturalEngineer.id,
            userId: agriculturalEngineer.userId,
            clients: agriculturalEngineer.clients
                ? agriculturalEngineer.clients.map((client) =>
                      ClientAppMapper.toDto(client),
                  )
                : [],
        };
    }
}
