"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { cropLabel, sicknessLabel } from "@/lib/agro-labels";
import type { TooltipProps } from "recharts";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BarChart2, Leaf, Sprout, TrendingUp, Upload } from "lucide-react";
import {
  useAnalytics,
  type AnalyticsRangePreset,
} from "../hooks/use-analytics";
import type { AnalyticsGranularity } from "../models/Analytics";
import { formatCompactNumber, formatPeriodLabel } from "../lib/utils";

const SEQUENTIAL_HUE = "#4CAF50";
const CATEGORICAL_PALETTE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
];
const OTHER_HUE = "#898781";

const CHART_THEME = {
  light: { grid: "#e4e4e7", axis: "#d4d4d8", tick: "#71717a" },
  dark: { grid: "#292524", axis: "#3a3532", tick: "#a39d97" },
};

const BAR_CHART_DISPLAY_LIMIT = 7;
const OTHER_BUCKET_LABEL = "Outras";

const RANGE_OPTIONS: { value: AnalyticsRangePreset; label: string }[] = [
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "365d", label: "Últimos 12 meses" },
  { value: "all", label: "Todo o período" },
];

const GRANULARITY_OPTIONS: { value: AnalyticsGranularity; label: string }[] = [
  { value: "day", label: "Diário" },
  { value: "week", label: "Semanal" },
  { value: "month", label: "Mensal" },
];

interface RankedBar {
  name: string;
  count: number;
}

function foldTopN(items: RankedBar[], limit: number): RankedBar[] {
  if (items.length <= limit) return items;

  const top = items.slice(0, limit);
  const otherCount = items
    .slice(limit)
    .reduce((sum, item) => sum + item.count, 0);

  return [...top, { name: OTHER_BUCKET_LABEL, count: otherCount }];
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between text-sm text-mediumGray">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primaryGreen/60" />
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && (
        <div className="mt-1 text-xs text-mediumGray truncate">{hint}</div>
      )}
    </div>
  );
}

function RankedBarChart({
  data,
  emptyLabel,
  colors,
}: {
  data: RankedBar[];
  emptyLabel: string;
  colors: { grid: string; axis: string; tick: string };
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-mediumGray">
        {emptyLabel}
      </div>
    );
  }

  const chartHeight = Math.max(160, data.length * 40);
  const axisTick = { fill: colors.tick, fontSize: 12 };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
        barCategoryGap={12}
      >
        <CartesianGrid
          horizontal={false}
          stroke={colors.grid}
          strokeWidth={1}
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={axisTick}
          axisLine={{ stroke: colors.axis }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={axisTick}
          axisLine={{ stroke: colors.axis }}
          tickLine={false}
        />
        <RechartsTooltip content={<BarTooltip />} cursor={{ fill: "rgba(76,175,80,0.06)" }} />
        <Bar
          dataKey="count"
          fill={SEQUENTIAL_HUE}
          barSize={20}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BarTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">
        {value} {Number(value) === 1 ? "análise" : "análises"}
      </p>
      <p className="text-xs text-mediumGray">{label}</p>
    </div>
  );
}

function PeriodTooltip({
  active,
  payload,
  label,
  granularity,
}: TooltipProps<number, string> & { granularity: AnalyticsGranularity }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-mediumGray mb-1">
        {formatPeriodLabel(String(label), granularity)}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey as string} className="flex items-center gap-2">
            <span
              className="inline-block h-0.5 w-3 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-semibold text-foreground">
              {entry.value}
            </span>
            <span className="text-xs text-mediumGray truncate">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  onStartAnalysis,
}: {
  onStartAnalysis?: () => void;
}) {
  const [range, setRange] = useState<AnalyticsRangePreset>("90d");
  const [granularity, setGranularity] =
    useState<AnalyticsGranularity>("month");
  const { analytics, isLoading } = useAnalytics(range, granularity);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const chartColors =
    mounted && resolvedTheme === "dark" ? CHART_THEME.dark : CHART_THEME.light;

  const diseaseBars = useMemo<RankedBar[]>(() => {
    if (!analytics) return [];
    return foldTopN(
      analytics.byDisease.map((d) => ({
        name: sicknessLabel(d.sicknessName),
        count: d.count,
      })),
      BAR_CHART_DISPLAY_LIMIT
    );
  }, [analytics]);

  const cropBars = useMemo<RankedBar[]>(() => {
    if (!analytics) return [];
    return foldTopN(
      analytics.byCrop.map((c) => ({ name: cropLabel(c.crop), count: c.count })),
      BAR_CHART_DISPLAY_LIMIT
    );
  }, [analytics]);

  const periodSeries = useMemo(() => {
    if (!analytics) return [];
    return analytics.byPeriod.map((p) => ({
      period: p.period,
      count: p.count,
    }));
  }, [analytics]);

  const incidenceSeries = useMemo(() => {
    if (!analytics || analytics.diseaseIncidenceByPeriod.length === 0) {
      return { data: [] as Record<string, string | number>[], keys: [] as string[] };
    }

    const seriesList = analytics.diseaseIncidenceByPeriod;
    const periods = seriesList[0]?.points.map((p) => p.period) ?? [];

    const data = periods.map((period, index) => {
      const row: Record<string, string | number> = { period };
      seriesList.forEach((series) => {
        row[series.sicknessId] = series.points[index]?.count ?? 0;
      });
      return row;
    });

    return { data, keys: seriesList.map((s) => s.sicknessId) };
  }, [analytics]);

  const seriesNameById = useMemo(() => {
    const map = new Map<string, string>();
    analytics?.diseaseIncidenceByPeriod.forEach((s) =>
      map.set(s.sicknessId, sicknessLabel(s.sicknessName))
    );
    return map;
  }, [analytics]);

  const trendInsight = useMemo(() => {
    const points = analytics?.byPeriod ?? [];
    if (points.length < 2) return null;
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const diff = last.count - prev.count;
    if (diff === 0) {
      return `${last.count} análises no último período, estável em relação ao anterior.`;
    }
    const pct = prev.count > 0 ? Math.round((Math.abs(diff) / prev.count) * 100) : null;
    const direction = diff > 0 ? 'a mais' : 'a menos';
    return `${last.count} análises no último período — ${Math.abs(diff)}${
      pct !== null ? ` (${pct}%)` : ''
    } ${direction} que no período anterior.`;
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Carregando estatísticas...</p>
      </div>
    );
  }

  if (!analytics || analytics.totalAnalyses === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <BarChart2 className="h-12 w-12 mb-4 text-primaryGreen/30" />
        <p className="font-medium">Ainda não há dados suficientes.</p>
        <p className="text-sm mt-1">
          Faça sua primeira análise para ver suas estatísticas aqui.
        </p>
        {onStartAnalysis && (
          <Button
            className="mt-4 bg-primaryGreen hover:bg-lightGreen"
            onClick={onStartAnalysis}
          >
            <Upload className="mr-2 h-4 w-4" />
            Fazer minha primeira análise
          </Button>
        )}
      </div>
    );
  }

  const diseaseShare =
    analytics.totalAnalyses > 0
      ? Math.round((analytics.diseasedCount / analytics.totalAnalyses) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select
          value={range}
          onValueChange={(value) => setRange(value as AnalyticsRangePreset)}
        >
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={granularity}
          onValueChange={(value) =>
            setGranularity(value as AnalyticsGranularity)
          }
        >
          <SelectTrigger className="sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRANULARITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y divide-border rounded-xl border lg:divide-y-0 lg:divide-x">
        <StatTile
          icon={BarChart2}
          label="Total de Análises"
          value={formatCompactNumber(analytics.totalAnalyses)}
          hint={
            analytics.peakPeriod
              ? `Pico em ${formatPeriodLabel(
                  analytics.peakPeriod.period,
                  analytics.granularity
                )} (${analytics.peakPeriod.count})`
              : undefined
          }
        />
        <StatTile
          icon={Sprout}
          label="Culturas Analisadas"
          value={String(analytics.distinctCropsCount)}
          hint={analytics.byCrop.map((c) => cropLabel(c.crop)).slice(0, 4).join(", ")}
        />
        <StatTile
          icon={Leaf}
          label="Doenças Detectadas"
          value={String(analytics.distinctDiseasesCount)}
          hint={`${diseaseShare}% das análises com doença identificada`}
        />
        <StatTile
          icon={TrendingUp}
          label="Confiança Média"
          value={
            analytics.averageCropConfidence !== null
              ? `${(analytics.averageCropConfidence * 100).toFixed(1)}%`
              : "—"
          }
          hint="Confiança na identificação da cultura"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análises ao Longo do Tempo</CardTitle>
          <CardDescription>
            {trendInsight ?? 'Volume de análises por período selecionado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={periodSeries}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={chartColors.grid}
                strokeWidth={1}
              />
              <XAxis
                dataKey="period"
                tickFormatter={(value) =>
                  formatPeriodLabel(value, analytics.granularity)
                }
                tick={{ fill: chartColors.tick, fontSize: 12 }}
                axisLine={{ stroke: chartColors.axis }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: chartColors.tick, fontSize: 12 }}
                axisLine={{ stroke: chartColors.axis }}
                tickLine={false}
                width={32}
              />
              <RechartsTooltip
                content={<PeriodTooltip granularity={analytics.granularity} />}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Análises"
                stroke={SEQUENTIAL_HUE}
                strokeWidth={2}
                fill={SEQUENTIAL_HUE}
                fillOpacity={0.1}
                dot={{ r: 4, fill: SEQUENTIAL_HUE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doenças Mais Frequentes</CardTitle>
            <CardDescription>Ranking por número de análises</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedBarChart
              data={diseaseBars}
              emptyLabel="Nenhuma doença identificada no período."
              colors={chartColors}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises por Cultura</CardTitle>
            <CardDescription>Ranking por número de análises</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedBarChart
              data={cropBars}
              emptyLabel="Nenhuma cultura registrada no período."
              colors={chartColors}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incidência de Doenças por Período</CardTitle>
          <CardDescription>
            As {Math.min(5, analytics.byDisease.length)} doenças mais
            frequentes, comparadas período a período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidenceSeries.data.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-mediumGray">
              Nenhuma doença identificada no período.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={incidenceSeries.data}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke={chartColors.grid}
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="period"
                    tickFormatter={(value) =>
                      formatPeriodLabel(value, analytics.granularity)
                    }
                    tick={{ fill: chartColors.tick, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.axis }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: chartColors.tick, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.axis }}
                    tickLine={false}
                    width={32}
                  />
                  <RechartsTooltip
                    content={
                      <PeriodTooltip granularity={analytics.granularity} />
                    }
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="line"
                    wrapperStyle={{ fontSize: 12, color: chartColors.tick }}
                    formatter={(value) => seriesNameById.get(value) ?? value}
                  />
                  {incidenceSeries.keys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={seriesNameById.get(key) ?? key}
                      stroke={
                        key === "other"
                          ? OTHER_HUE
                          : CATEGORICAL_PALETTE[
                              index % CATEGORICAL_PALETTE.length
                            ]
                      }
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {analytics.diseasePeakPeriods.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-mediumGray">
                        <th className="pb-2 font-medium">Doença</th>
                        <th className="pb-2 font-medium">
                          Período de maior incidência
                        </th>
                        <th className="pb-2 font-medium text-right">
                          Análises
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.diseasePeakPeriods.map((peak) => (
                        <tr
                          key={peak.sicknessId}
                          className="border-b last:border-0"
                        >
                          <td className="py-2">{sicknessLabel(peak.sicknessName)}</td>
                          <td className="py-2 text-muted-foreground">
                            {formatPeriodLabel(
                              peak.period,
                              analytics.granularity
                            )}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {peak.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
