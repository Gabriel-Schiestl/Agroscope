export interface History {
    id: string;
    createdAt: Date;
    sicknessId?: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling: string;
    image: string;
    explanation?: string;
    causes?: string;
    userId?: string;
}
