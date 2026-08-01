"use client";

import { useState, useEffect, useCallback } from "react";
import GetHistoryAPI from "../../api/history/GetHistory";
import type { History } from "../models/History";

export function useHistory() {
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const response = await GetHistoryAPI();
    setHistory(response ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, refetch: fetchHistory };
}
