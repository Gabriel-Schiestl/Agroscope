export const CROP_LABELS: Record<string, string> = {
    CORN: 'Milho',
    SOYBEAN: 'Soja',
    WHEAT: 'Trigo',
};

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
};

export function cropLabel(crop?: string): string {
    if (!crop) return 'Não identificada';
    return CROP_LABELS[crop.toUpperCase()] ?? crop;
}

export function sicknessLabel(name?: string): string {
    if (!name) return 'Não identificada';
    return SICKNESS_LABELS[name] ?? name.replace(/_/g, ' ');
}
