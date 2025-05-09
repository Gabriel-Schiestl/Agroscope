import { AgriculturalEngineerImpl } from './AgriculturalEngineerData.repository';
import { CalendarRepositoryImpl } from './CalendarData.repository';
import { HistoryRepositoryImpl } from './HistoryData.repository';
import { ImageDataRepository } from './ImageData.repository';
import { KnowledgeDataRepository } from './KnowledgeData.repository';
import { ReportRepositoryImpl } from './ReportData.repository';
import { SicknessDataRepository } from './SicknessData.repository';
import { UserDataRepository } from './UserData.repository';

export const repositories = [
    {
        provide: 'KnowledgeRepository',
        useClass: KnowledgeDataRepository,
    },
    {
        provide: 'SicknessRepository',
        useClass: SicknessDataRepository,
    },
    {
        provide: 'HistoryRepository',
        useClass: HistoryRepositoryImpl,
    },
    {
        provide: 'ImageRepository',
        useClass: ImageDataRepository,
    },
    {
        provide: 'UserRepository',
        useClass: UserDataRepository,
    },
    {
        provide: 'AgriculturalEngineerRepository',
        useClass: AgriculturalEngineerImpl,
    },
    {
        provide: 'ReportRepository',
        useClass: ReportRepositoryImpl,
    },
    {
        provide: 'CalendarRepository',
        useClass: CalendarRepositoryImpl,
    },
];
