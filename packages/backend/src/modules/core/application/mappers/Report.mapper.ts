import { Report } from '../../domain/models/Report';
import { ReportDto } from '../dto/Report.dto';

export class ReportAppMapper {
    static toDto(report: Report): ReportDto {
        return {
            id: report.id,
            title: report.title,
            content: report.content,
            status: report.status,
            attachments: report.attachments,
        };
    }
}
