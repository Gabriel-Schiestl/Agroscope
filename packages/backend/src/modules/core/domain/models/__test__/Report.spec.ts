import { Report, ReportStatus } from '../Report';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

describe('Report Domain', () => {
    const validProps = {
        title: 'Relatório',
        content: 'Conteúdo do relatório',
        status: ReportStatus.DRAFT,
        clientId: 'client-1',
        engineerId: 'engineer-1',
        attachments: ['file1.pdf'],
        visitId: 'visit-1',
    };

    it('should create a report successfully', () => {
        const result = Report.create(validProps);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value).toBeInstanceOf(Report);
            expect(result.value.title).toBe(validProps.title);
            expect(result.value.content).toBe(validProps.content);
            expect(result.value.status).toBe(validProps.status);
            expect(result.value.clientId).toBe(validProps.clientId);
            expect(result.value.engineerId).toBe(validProps.engineerId);
            expect(result.value.attachments).toEqual(validProps.attachments);
            expect(result.value.visitId).toBe(validProps.visitId);
            expect(result.value.createdAt).toBeInstanceOf(Date);
            expect(result.value.id).toBeDefined();
        }
    });

    it('should fail to create a report with missing required fields', () => {
        const result = Report.create({ ...validProps, title: '' });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
            expect(result.error.message).toBe(
                'Title, content, engineer id, client id and status are required',
            );
        }
    });

    it('should load a report with given id', () => {
        const now = new Date();
        const report = Report.load(
            { ...validProps, createdAt: now },
            'custom-id',
        );
        expect(report).toBeInstanceOf(Report);
        expect(report.id).toBe('custom-id');
        expect(report.createdAt).toBe(now);
    });
});
