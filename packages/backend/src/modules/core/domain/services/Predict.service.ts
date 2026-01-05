import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export interface PredictServiceResponse {
    plant: string;
    plantConfidence: number;
    prediction: string;
    predictionConfidence: number;
}

export interface HandlingServiceResponse {
    diagnostico: string;
    explicacao: string;
    causas: string;
    manejo: string;
}

export interface PredictService {
    predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>>;
    getImageBase64(
        imagePath: string,
    ): Promise<Result<TechnicalException, string>>;
    getHandling(
        prediction: string,
        crop: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>>;
}
