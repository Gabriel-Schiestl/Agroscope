import { Client } from '../../domain/models/Client';
import { Report } from '../../domain/models/Report';
import { Visit } from '../../domain/models/Visit';
import { ClientDto } from '../dto/Client.dto';
import { ReportAppMapper } from './Report.mapper';
import { VisitAppMapper } from './Visit.mapper';

export interface ClientAppMapperProps extends Client {
    visits?: Visit[];
    reports?: Report[];
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
            reports: client.reports
                ? client.reports.map((report) => ReportAppMapper.toDto(report))
                : [],
            createdAt: client.createdAt,
        };
    }
}
