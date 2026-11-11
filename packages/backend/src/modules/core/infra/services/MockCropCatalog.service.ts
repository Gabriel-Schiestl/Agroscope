import { Injectable } from '@nestjs/common';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { AvailableCrop } from '../../domain/models/Crop';
import { CropCatalogService } from '../../domain/services/CropCatalog.service';

// Usado com MOCK_AI=true (testes de sistema), quando não há IA para consultar.
// Espelha o GET /cultures da IA com todos os modelos carregados.
const MOCK_CROPS: AvailableCrop[] = [
    { code: 'COFFEE', label: 'Café', classes: ['Healthy', 'Phoma', 'Rust'] },
    {
        code: 'SOYBEAN',
        label: 'Soja',
        classes: ['Bacterial_Blight', 'Healthy', 'Rust'],
    },
    {
        code: 'WHEAT',
        label: 'Trigo',
        classes: ['Blight', 'Healthy', 'Rust_Common'],
    },
    {
        code: 'TOMATO',
        label: 'Tomate',
        classes: ['Bacterial_Spot', 'Healthy', 'Leaf_Mold'],
    },
    {
        code: 'CORN',
        label: 'Milho',
        classes: ['Blight', 'Common_Rust', 'Healthy'],
    },
];

@Injectable()
export class MockCropCatalogService implements CropCatalogService {
    async getAvailableCrops(): Promise<
        Result<TechnicalException, AvailableCrop[]>
    > {
        return Res.success(MOCK_CROPS);
    }
}
