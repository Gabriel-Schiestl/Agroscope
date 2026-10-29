import { useState, useEffect } from 'react';
import api from '@/shared/http/http.config';
import { CropOption, registerCropLabels } from '@/lib/agro-labels';

/**
 * Culturas que podem ser analisadas agora. Vêm do backend (GET /crops), que
 * por sua vez lê as culturas com modelo carregado na IA — uma cultura nova
 * aparece aqui sem mudança no app.
 */
export function useAnalysisCrops() {
    const [crops, setCrops] = useState<CropOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        api
            .get<CropOption[]>('/crops')
            .then((res) => {
                registerCropLabels(res.data);
                if (active) setCrops(res.data);
            })
            .catch((err) => {
                if (!active) return;
                setError(
                    err?.response?.data?.message ??
                        'Não foi possível carregar as culturas disponíveis.',
                );
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    return { crops, isLoading, error };
}
