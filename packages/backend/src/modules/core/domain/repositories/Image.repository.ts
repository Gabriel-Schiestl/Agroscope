import { Exception } from 'src/shared/Exception';
import { Result } from 'src/shared/Result';

export interface ImageRepository {
    save(image: string, prediction: string): Promise<Result<Exception, void>>;
}
