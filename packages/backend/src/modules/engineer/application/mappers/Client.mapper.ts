import { CalendarEvent } from '../../../calendar/domain/models/CalendarEvent';
import { Client } from '../../../engineer/domain/models/Client';
import { ClientDto } from '../dto/Client.dto';
import { CalendarEventAppMapper } from '../../../calendar/application/mappers/CalendarEvent.mapper';
import { Report } from '../../domain/models/Report';
import { ReportAppMapper } from './Report.mapper';

export interface ClientAppMapperProps extends Client {
    reports?: Report[];
    calendarEvents?: CalendarEvent[];
}

export class ClientAppMapper {
    static toDto(client: ClientAppMapperProps): ClientDto {
        return {
            id: client.id,
            name: client.name,
            email: client.email,
            address: client.address,
            person: client.person,
            document: client.document,
            telephone: client.telephone,
            totalArea: client.totalArea,
            totalAreaPlanted: client.totalAreaPlanted,
            active: client.active,
            actualCrop: client.actualCrop,
            reports: client.reports
                ? client.reports.map((report) => ReportAppMapper.toDto(report))
                : [],
            calendarEvents: client.calendarEvents
                ? client.calendarEvents.map((event) =>
                      CalendarEventAppMapper.toDto(event),
                  )
                : [],
            createdAt: client.createdAt,
        };
    }
}
