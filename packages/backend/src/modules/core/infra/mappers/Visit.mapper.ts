import { Visit } from '../../domain/models/Visit';
import { VisitModel } from '../models/Visit.model';
import { ReportMapper } from './Report.mapper';

export class VisitMapper {
    static domainToModel(visit: Visit): VisitModel {
        return new VisitModel().setProps({
            id: visit.id,
            status: visit.status,
            clientId: visit.clientId,
            engineerId: visit.engineerId,
            notes: visit.notes,
            scheduledDate: visit.scheduledDate,
            createdAt: visit.createdAt,
        });
    }

    static modelToDomain(visit: VisitModel): Visit {
        return Visit.load(
            {
                status: visit.status,
                engineerId: visit.engineerId,
                clientId: visit.clientId,
                notes: visit.notes,
                scheduledDate: visit.scheduledDate,
                createdAt: visit.createdAt,
            },
            visit.id,
        );
    }
}
