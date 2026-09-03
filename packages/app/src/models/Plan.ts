export interface Plan {
    id: string;
    type: string;
    imageLimit: number;
    chatLimit: number;
    features: string[];
    price: number;
}
