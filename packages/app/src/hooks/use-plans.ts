import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/http/http.config';
import type { Plan } from '@/models/Plan';

export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<Plan[]>('/plan');
            setPlans([...response.data].sort((a, b) => a.price - b.price));
        } catch {
            setPlans([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return { plans, isLoading, refetch: fetchPlans };
}
