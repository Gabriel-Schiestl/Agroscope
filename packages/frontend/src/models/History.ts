export interface History {
  id: string;
  createdAt: Date;
  sicknessId?: string;
  sicknessName?: string;
  sicknessConfidence?: number;
  crop: string;
  cropConfidence: number;
  handling: string;
  image: string;
  explanation?: string;
  causes?: string;
  precautions?: string;
  userId?: string;
}
