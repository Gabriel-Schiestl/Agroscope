import { Injectable } from '@nestjs/common';
import { ImageRepository } from '../../domain/repositories/Image.repository';
import { ImageMapper } from '../mappers/Image.mapper';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

@Injectable()
export class ImageDataRepository implements ImageRepository {
    async save(
        image: string,
        prediction: string,
    ): Promise<Result<TechnicalException, void>> {
        try {
            const result = ImageMapper.domainToModel(image, prediction);
            await result.save();

            return Res.success();
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on save image data'),
            );
        }
    }
}
