import { Module } from '@nestjs/common';
import { CoreController } from './controllers/core.controller';
import { queries } from './application/query';
import { ImageMapper } from './infra/mappers/Image.mapper';
import { useCases } from './application/usecases';
import { repositories } from './infra/repositories';
import { mappers } from './infra/mappers';

@Module({
    imports: [],
    controllers: [CoreController],
    providers: [...useCases, ...queries, ...mappers, ...repositories],
    exports: [],
})
export class CoreModule {}
