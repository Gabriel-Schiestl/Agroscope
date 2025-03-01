import { Inject, Injectable } from '@nestjs/common';
import { ImageRepository } from '../../domain/repositories/Image.repository';
import { Res, Result } from 'src/shared/Result';
import { Exception } from 'src/shared/Exception';

@Injectable()
export class SaveImageQuery {
    constructor(
        @Inject('ImageRepository')
        private readonly imageRepository: ImageRepository,
    ) {}

    async execute(
        image: string,
        prediction: string,
    ): Promise<Result<Exception, void>> {
        const result = await this.imageRepository.save(image, prediction);
        if (result.isFailure()) return Res.failure(result.error);

        return Res.success();
    }
}
