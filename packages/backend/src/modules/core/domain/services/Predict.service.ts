import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export interface PredictServiceResponse {
    plant: string,
    plant_confidence: number,
    prediction: string,
    prediction_confidence: number
}

export interface PredictService {
    predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>>;
    getImageBase64(
        imagePath: string,
    ): Promise<Result<TechnicalException, string>>;
}
