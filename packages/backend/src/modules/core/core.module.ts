import { Module } from '@nestjs/common';
import { CoreController } from './controllers/core.controller';
import { PredictUseCase } from './application/usecases/Predict.usecase';
import { KnowledgeDataRepository } from './infra/repositories/KnowledgeData.repository';
import { SicknessDataRepository } from './infra/repositories/SicknessData.repository';

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
  ],
  exports: [],
})
export class CoreModule {}
