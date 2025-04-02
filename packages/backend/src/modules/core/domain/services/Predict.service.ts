import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export interface PredictServiceResponse {
    prediction: string;
}

export interface PredictService {
    predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>>;
    getImageBase64(
        imagePath: string,
    ): Promise<Result<TechnicalException, string>>;
}
