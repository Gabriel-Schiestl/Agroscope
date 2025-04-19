import { Visit } from '../../domain/models/Visit';
import { VisitDto } from '../dto/Visit.dto';
import { ReportAppMapper } from './Report.mapper';

export class VisitAppMapper {
    static toDto(visit: Visit): VisitDto {
        return {
            id: visit.id,
            status: visit.status,
            notes: visit.notes,
            scheduledDate: visit.scheduledDate,
            reports: visit.reports?.map((report) =>
                ReportAppMapper.toDto(report),
            ),
            createdAt: visit.createdAt,
        };
    }
}
