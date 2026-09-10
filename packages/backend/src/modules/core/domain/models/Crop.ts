export enum Crop {
    SOYBEAN = 'SOYBEAN',
    WHEAT = 'WHEAT',
    TOMATO = 'TOMATO',
}

export const CROP_LABELS: Record<Crop, string> = {
    [Crop.SOYBEAN]: 'Soja',
    [Crop.WHEAT]: 'Trigo',
    [Crop.TOMATO]: 'Tomate',
};

// TOMATO ainda não tem modelo de IA treinado — fica disponível para seleção
// (preparando o app para quando o modelo entrar), mas bloqueado no
// PredictUseCase antes de chamar o serviço de predição.
export const CROPS_AVAILABLE_FOR_ANALYSIS: Crop[] = [Crop.SOYBEAN, Crop.WHEAT];
