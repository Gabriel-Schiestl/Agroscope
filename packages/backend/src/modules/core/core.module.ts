import { Module } from '@nestjs/common';
import { CoreController } from './controllers/core.controller';
import { PredictUseCase } from './application/usecases/Predict.usecase';
import { KnowledgeDataRepository } from './infra/repositories/KnowledgeData.repository';
import { SicknessDataRepository } from './infra/repositories/SicknessData.repository';
import { HistoryRepositoryImpl } from './infra/repositories/History.repository';

@Module({
    imports: [],
    controllers: [CoreController],
    providers: [
        PredictUseCase,
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
    ],
    exports: [],
})
export class CoreModule {}
