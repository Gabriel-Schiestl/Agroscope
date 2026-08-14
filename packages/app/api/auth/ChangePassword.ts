import api from '../../src/shared/http/http.config';

export interface ChangePasswordResult {
    success: boolean;
    message?: string;
}

export default async function ChangePasswordAPI(
    email: string,
    token: string,
    newPassword: string,
): Promise<ChangePasswordResult> {
    try {
        await api.post('/auth/change-password', { email, token, newPassword });
        return { success: true };
    } catch (error: any) {
        console.log('Erro ao trocar senha:', error);
        const message = error?.response?.data?.message;
        return {
            success: false,
            message: typeof message === 'string' ? message : undefined,
        };
    }
}
