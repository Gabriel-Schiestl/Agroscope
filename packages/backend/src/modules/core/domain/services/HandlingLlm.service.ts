import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { HandlingServiceResponse } from './Predict.service';

export interface HandlingLlmService {
    getHandling(
        prediction: string,
        crop: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>>;
}
