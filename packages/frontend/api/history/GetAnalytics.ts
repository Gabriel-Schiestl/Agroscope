import api from "../../shared/http/http.config";
import type {
  AnalyticsGranularity,
  HistoryAnalytics,
} from "../../src/models/Analytics";

export interface GetAnalyticsParams {
  startDate?: Date;
  endDate?: Date;
  granularity?: AnalyticsGranularity;
}

export default async function GetAnalyticsAPI(
  params?: GetAnalyticsParams
): Promise<HistoryAnalytics | null> {
  try {
    const response = await api.get<HistoryAnalytics>("/history/analytics", {
      params: {
        startDate: params?.startDate?.toISOString(),
        endDate: params?.endDate?.toISOString(),
        granularity: params?.granularity,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting analytics:", error);
    return null;
  }
}
