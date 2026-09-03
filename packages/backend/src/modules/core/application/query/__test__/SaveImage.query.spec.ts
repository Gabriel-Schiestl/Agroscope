import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { ImageRepository } from '../../../domain/repositories/Image.repository';
import { SaveImageQuery } from '../SaveImage.query';

describe('SaveImageQuery', () => {
    let imageRepository: jest.Mocked<ImageRepository>;
    let query: SaveImageQuery;

    beforeEach(() => {
        imageRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        query = new SaveImageQuery(imageRepository);
    });

    it('should save the image and prediction', async () => {
        const result = await query.execute('base64-image', 'Ferrugem');

        expect(result.isSuccess()).toBe(true);
        expect(imageRepository.save).toHaveBeenCalledWith(
            'base64-image',
            'Ferrugem',
        );
    });

    it('should propagate a repository failure', async () => {
        const error = new TechnicalException('could not save');
        imageRepository.save.mockResolvedValue(Res.failure(error));

        const result = await query.execute('base64-image', 'Ferrugem');

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
