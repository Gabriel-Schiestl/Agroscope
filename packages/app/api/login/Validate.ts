import api from '../../src/shared/http/http.config';

export interface ValidateResponse {
    isEngineer: boolean;
    isAdmin: boolean;
    name: string;
    email: string;
    planId?: string;
}

export default async function Validate(): Promise<ValidateResponse | null> {
    try {
        const response = await api.get<ValidateResponse>('/auth/validate', {
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        console.log('Erro ao validar sessão:', error);
        return null;
    }
}
