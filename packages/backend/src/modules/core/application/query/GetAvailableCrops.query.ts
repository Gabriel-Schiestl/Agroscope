import { Inject, Injectable } from '@nestjs/common';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { CropCatalogService } from '../../domain/services/CropCatalog.service';
import { CropDto } from '../dto/Crop.dto';

@Injectable()
export class GetAvailableCropsQuery {
    constructor(
        @Inject('CropCatalogService')
        private readonly cropCatalogService: CropCatalogService,
    ) {}

    async execute(): Promise<Result<Exception, CropDto[]>> {
        const result = await this.cropCatalogService.getAvailableCrops();
        if (result.isFailure()) return Res.failure(result.error);

        return Res.success(
            result.value
                .map(({ code, label }) => ({ code, label }))
                .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
        );
    }
}
