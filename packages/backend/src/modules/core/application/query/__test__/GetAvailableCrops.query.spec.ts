import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { CropCatalogService } from '../../../domain/services/CropCatalog.service';
import { GetAvailableCropsQuery } from '../GetAvailableCrops.query';

describe('GetAvailableCropsQuery', () => {
    let cropCatalogService: jest.Mocked<CropCatalogService>;
    let query: GetAvailableCropsQuery;

    beforeEach(() => {
        cropCatalogService = {
            getAvailableCrops: jest.fn().mockResolvedValue(
                Res.success([
                    { code: 'TOMATO', label: 'Tomate', classes: ['Healthy'] },
                    { code: 'COFFEE', label: 'Café', classes: ['Rust'] },
                    { code: 'CORN', label: 'Milho', classes: ['Healthy'] },
                ]),
            ),
        };
        query = new GetAvailableCropsQuery(cropCatalogService);
    });

    it('should return code and label of each crop, sorted by label', async () => {
        const result = await query.execute();

        expect(result.isSuccess() && result.value).toEqual([
            { code: 'COFFEE', label: 'Café' },
            { code: 'CORN', label: 'Milho' },
            { code: 'TOMATO', label: 'Tomate' },
        ]);
    });

    it('should propagate the failure when the IA is not available', async () => {
        const error = new TechnicalException('indisponível');
        cropCatalogService.getAvailableCrops.mockResolvedValue(
            Res.failure(error),
        );

        const result = await query.execute();

        expect(result.isFailure() && result.error).toBe(error);
    });
});
