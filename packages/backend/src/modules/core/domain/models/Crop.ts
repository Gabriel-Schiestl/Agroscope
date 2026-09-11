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

export const CROPS_AVAILABLE_FOR_ANALYSIS: Crop[] = [
    Crop.SOYBEAN,
    Crop.WHEAT,
    Crop.TOMATO,
];
