import api from '../../src/shared/http/http.config';

export interface PasswordRecoveryResult {
    success: boolean;
}

export default async function PasswordRecoveryAPI(
    email: string,
): Promise<PasswordRecoveryResult> {
    try {
        await api.post('/auth/recovery-token', { email });
        return { success: true };
    } catch (error: any) {
        console.log('Erro ao solicitar recuperação de senha:', error);
        // Sempre retorna sucesso para não revelar se o email existe na base
        return { success: error?.response ? true : false };
    }
}
