import { ReportStatus, Report } from '../Report';

describe('Report', () => {
    const report: Report = {
        id: 'report-1',
        title: 'Relatório de Visita',
        content: 'Conteúdo do relatório',
        status: ReportStatus.DRAFT,
        clientId: 'client-1',
        engineerId: 'engineer-1',
        attachments: ['file1.pdf', 'file2.pdf'],
        visitId: 'visit-1',
        createdAt: new Date('2025-07-24T10:00:00Z'),
    };

    it('should have correct properties', () => {
        expect(report.id).toBe('report-1');
        expect(report.title).toBe('Relatório de Visita');
        expect(report.content).toBe('Conteúdo do relatório');
        expect(report.status).toBe(ReportStatus.DRAFT);
        expect(report.clientId).toBe('client-1');
        expect(report.engineerId).toBe('engineer-1');
        expect(report.attachments).toEqual(['file1.pdf', 'file2.pdf']);
        expect(report.visitId).toBe('visit-1');
        expect(report.createdAt).toEqual(new Date('2025-07-24T10:00:00Z'));
    });
});
