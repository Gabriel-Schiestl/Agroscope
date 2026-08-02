import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/shared/http/http.config';
import type { AnalyticsGranularity, HistoryAnalytics } from '@/models/Analytics';

export type AnalyticsRangePreset = '30d' | '90d' | '365d' | 'all';

const RANGE_TO_DAYS: Record<AnalyticsRangePreset, number | null> = {
    '30d': 30,
    '90d': 90,
    '365d': 365,
    all: null,
};

export function useAnalytics(
    range: AnalyticsRangePreset = '90d',
    granularity: AnalyticsGranularity = 'month',
) {
    const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const startDate = useMemo(() => {
        const days = RANGE_TO_DAYS[range];
        if (days === null) return undefined;
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }, [range]);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<HistoryAnalytics>(
                '/history/analytics',
                {
                    params: {
                        startDate: startDate?.toISOString(),
                        granularity,
                    },
                },
            );
            setAnalytics(response.data);
        } catch {
            setAnalytics(null);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, granularity]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return { analytics, isLoading, refetch: fetchAnalytics };
}
