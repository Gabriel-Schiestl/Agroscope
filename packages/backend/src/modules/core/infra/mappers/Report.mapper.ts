import { Report } from '../../domain/models/Report';
import { ReportModel } from '../models/Report.model';

export class ReportMapper {
    static domainToModel(report: Report): ReportModel {
        return new ReportModel().setProps({
            id: report.id,
            title: report.title,
            content: report.content,
            status: report.status,
            clientId: report.clientId,
            engineerId: report.engineerId,
            attachments: report.attachments,
            createdAt: report.createdAt,
        });
    }

    static modelToDomain(report: ReportModel): Report {
        return Report.load(
            {
                title: report.title,
                content: report.content,
                status: report.status,
                clientId: report.clientId,
                engineerId: report.engineerId,
                attachments: report.attachments,
                createdAt: report.createdAt,
            },
            report.id,
        );
    }
}
