export const CROP_LABELS: Record<string, string> = {
    CORN: 'Milho',
    SOYBEAN: 'Soja',
    WHEAT: 'Trigo',
    TOMATO: 'Tomate',
    COFFEE: 'Café',
};

/** Culturas disponíveis para seleção obrigatória antes do envio da foto para análise. */
export const ANALYSIS_CROP_OPTIONS: { value: string; label: string }[] = [
    { value: 'SOYBEAN', label: 'Soja' },
    { value: 'WHEAT', label: 'Trigo' },
    { value: 'TOMATO', label: 'Tomate' },
    { value: 'COFFEE', label: 'Café' },
];

export const SICKNESS_LABELS: Record<string, string> = {
    Rust_Blight: 'Ferrugem Polissora',
    RUST_BLIGHT: 'Ferrugem Polissora',
    Rust_Common: 'Ferrugem Comum',
    RUST_COMMON: 'Ferrugem Comum',
    Brown_Rust: 'Ferrugem Parda',
    BROWN_RUST: 'Ferrugem Parda',
    Yellow_Rust: 'Ferrugem Amarela',
    YELLOW_RUST: 'Ferrugem Amarela',
    Soybean_Rust: 'Ferrugem Asiática',
    SOYBEAN_RUST: 'Ferrugem Asiática',
    Target_Spot: 'Mancha Alvo',
    TARGET_SPOT: 'Mancha Alvo',
    Bacterial_Spot: 'Pinta Bacteriana',
    BACTERIAL_SPOT: 'Pinta Bacteriana',
    Leaf_Mold: 'Mofo das Folhas',
    LEAF_MOLD: 'Mofo das Folhas',
    Rust: 'Ferrugem do Cafeeiro',
    RUST: 'Ferrugem do Cafeeiro',
    Phoma: 'Mancha de Phoma',
    PHOMA: 'Mancha de Phoma',
};

export function cropLabel(crop?: string): string {
    if (!crop) return 'Não identificada';
    return CROP_LABELS[crop.toUpperCase()] ?? crop;
}

export function sicknessLabel(name?: string): string {
    if (!name) return 'Não identificada';
    return SICKNESS_LABELS[name] ?? name.replace(/_/g, ' ');
}
