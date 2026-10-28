// As culturas não são fixas no código: a IA declara as que tem modelo carregado
// (GET /cultures) e o backend as lê via CropCatalogService. Uma cultura nova
// aparece aqui sem mudança no backend, front ou app.
//
// Código da cultura (ex.: 'SOYBEAN', 'CORN'), o mesmo salvo em history.crop e
// sickness.crop.
export type Crop = string;

export interface AvailableCrop {
    code: Crop;
    // Nome exibido ao usuário (ex.: 'Soja')
    label: string;
    // Classes que o modelo da cultura reconhece (ex.: 'Healthy', 'Rust')
    classes: string[];
}
