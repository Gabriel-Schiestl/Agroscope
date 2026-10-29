import { Exception } from 'src/shared/Exception';
import { Result } from 'src/shared/Result';
import { AvailableCrop } from '../models/Crop';

export interface CropCatalogService {
    /**
     * Culturas que a IA consegue analisar agora. Falha só quando a IA nunca
     * respondeu desde que o backend subiu (sem catálogo conhecido).
     */
    getAvailableCrops(): Promise<Result<Exception, AvailableCrop[]>>;
}
