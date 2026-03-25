import { HistoryRepositoryImpl } from './HistoryData.repository';
import { ImageDataRepository } from './ImageData.repository';
import { SicknessDataRepository } from './SicknessData.repository';
import { UserDataRepository } from './UserData.repository';
import { PlanDataRepository } from './PlanData.repository';
import { LimitDataRepository } from './LimitData.repository';

export const repositories = [
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
        provide: 'PlanRepository',
        useClass: PlanDataRepository,
    },
    {
        provide: 'LimitRepository',
        useClass: LimitDataRepository,
    },
];
