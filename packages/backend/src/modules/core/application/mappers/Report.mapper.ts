import { Report } from '../../domain/models/Report';
import { ReportDto } from '../dto/Report.dto';

export class ReportAppMapper {
    static toDto(report: Report): ReportDto {
        return {
            id: report.id,
            title: report.title,
            content: report.content,
            status: report.status,
            clientId: report.clientId,
            engineerId: report.engineerId,
            attachments: report.attachments,
            visitId: report.visitId,
            createdAt: report.createdAt,
        };
    }
}
