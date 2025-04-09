import { Visit } from '../../domain/models/Visit';
import { VisitModel } from '../models/Visit.model';
import { ReportMapper } from './Report.mapper';

export class VisitMapper {
    static domainToModel(visit: Visit): VisitModel {
        return new VisitModel().setProps({
            id: visit.id,
            status: visit.status,
            notes: visit.notes,
            scheduledDate: visit.scheduledDate,
            reports: visit.reports
                ? visit.reports.map(ReportMapper.domainToModel)
                : [],
            createdAt: visit.createdAt,
        });
    }

    static modelToDomain(visit: VisitModel): Visit {
        return Visit.load(
            {
                status: visit.status,
                notes: visit.notes,
                scheduledDate: visit.scheduledDate,
                reports: visit.reports
                    ? visit.reports.map(ReportMapper.modelToDomain)
                    : [],
                createdAt: visit.createdAt,
            },
            visit.id,
        );
    }
}
