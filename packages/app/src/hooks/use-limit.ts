import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/http/http.config';

export interface LimitData {
    imageRequests: number;
    imageLimit: number;
    chatRequests: number;
    chatLimit: number;
}

export function useLimit() {
    const [limit, setLimit] = useState<LimitData | null>(null);

    const fetchLimit = useCallback(async () => {
        try {
            const res = await api.get<LimitData>('/limit');
            setLimit(res.data);
        } catch {
            // silently ignore — limit info is non-critical
        }
    }, []);

    useEffect(() => {
        fetchLimit();
    }, [fetchLimit]);

    return { limit, refetch: fetchLimit };
}
