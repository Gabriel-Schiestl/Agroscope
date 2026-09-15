import React, { useState } from 'react';
import { View } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { CartesianChart, Area, Line, Scatter, useChartPressState } from 'victory-native';
import { Circle } from '@shopify/react-native-skia';

import { ThemedText } from '@/components/themed-text';
import { formatPeriodLabel } from '@/lib/utils';
import { sicknessLabel } from '@/lib/agro-labels';
import { SEQUENTIAL_HUE, CATEGORICAL_PALETTE, OTHER_HUE } from '@/constants/analytics-colors';
import type { ThemePalette } from '@/constants/theme';
import type { AnalyticsGranularity, DiseasePeak, PeriodCount } from '@/models/Analytics';
import { styles } from '@/styles/analytics.styles';

// O CartesianChart não consegue tipar genericamente um conjunto dinâmico de
// yKeys (as doenças só são conhecidas em tempo de execução) nem aceita um
// `data` tipado por uma interface nomeada (exige um Record<string, unknown>
// estrutural) — então usamos um wrapper com tipos relaxados para os dois
// gráficos desta tela.
const DynamicCartesianChart = CartesianChart as unknown as React.ComponentType<{
    data: Record<string, string | number>[];
    xKey: string;
    yKeys: string[];
    domain?: { y?: [number] | [number, number] };
    domainPadding?: { top?: number; bottom?: number; left?: number; right?: number };
    chartPressState?: unknown;
    children: (args: {
        points: Record<string, import('victory-native').PointsArray>;
        chartBounds: { top: number; bottom: number; left: number; right: number };
    }) => React.ReactNode;
}>;

interface PeriodChartCardProps {
    periodSeries: PeriodCount[];
    granularity: AnalyticsGranularity;
    colors: ThemePalette;
    isDark: boolean;
}

export function PeriodChartCard({ periodSeries, granularity, colors, isDark }: PeriodChartCardProps) {
    const periodPress = useChartPressState({ x: '', y: { count: 0 } });
    const [periodTooltip, setPeriodTooltip] = useState<{
        index: number;
        left: number;
        top: number;
        period: string;
        count: number;
    } | null>(null);

    const handlePeriodTooltipRelease = (data: {
        index: number;
        left: number;
        top: number;
        period: string;
        count: number;
    }) => {
        // Toque único: se já está aberto no mesmo ponto, fecha; senão abre/troca.
        setPeriodTooltip((existing) => (existing && existing.index === data.index ? null : data));
    };

    useAnimatedReaction(
        () => ({
            active: periodPress.state.isActive.value,
            index: periodPress.state.matchedIndex.value,
            left: periodPress.state.x.position.value,
            top: periodPress.state.y.count.position.value,
            period: periodPress.state.x.value.value,
            count: periodPress.state.y.count.value.value,
        }),
        (curr, prev) => {
            // O gesto do victory-native só entrega posição/valor enquanto o dedo
            // está pressionado (ao soltar, ele zera tudo). Por isso capturamos o
            // estado anterior (ainda pressionado) no momento em que a soltura é
            // detectada, em vez de reagir a "curr" (já resetado).
            if (!curr.active && prev?.active) {
                runOnJS(handlePeriodTooltipRelease)(prev);
            }
        },
    );

    return (
        <View style={styles.chartCard}>
            <ThemedText style={styles.diseasesTitle}>Análises ao Longo do Tempo</ThemedText>
            <ThemedText style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                Volume de análises por período selecionado
            </ThemedText>
            <View style={styles.chartArea}>
                {/* domain.y fixa o mínimo em 0: sem isso, quando todos os
                    pontos têm a mesma contagem (ex.: um único período), o
                    domínio Y calculado automaticamente colapsa (min === max)
                    e a escala do victory-native gera NaN, deixando a linha
                    invisível mesmo com o quadro do gráfico renderizado. */}
                <DynamicCartesianChart
                    data={periodSeries as unknown as Record<string, string | number>[]}
                    xKey="period"
                    yKeys={['count']}
                    domain={{ y: [0] }}
                    domainPadding={{ top: 16, bottom: 4 }}
                    chartPressState={periodPress.state}
                >
                    {({ points, chartBounds }) => (
                        <>
                            <Area
                                points={points.count}
                                y0={chartBounds.bottom}
                                color={SEQUENTIAL_HUE}
                                opacity={0.15}
                                curveType="natural"
                            />
                            <Line
                                points={points.count}
                                color={SEQUENTIAL_HUE}
                                strokeWidth={2}
                                curveType="natural"
                            />
                            {/* Um Line entre 2 pontos ou menos não desenha nada
                                visível (d3 só traça segmento com >= 2 pontos), então
                                marcamos cada ponto com Scatter para garantir que o
                                período apareça mesmo com pouco histórico. */}
                            <Scatter points={points.count} color={SEQUENTIAL_HUE} radius={4} />
                            {periodTooltip && (
                                <Circle
                                    cx={periodTooltip.left}
                                    cy={periodTooltip.top}
                                    r={6}
                                    color={SEQUENTIAL_HUE}
                                />
                            )}
                        </>
                    )}
                </DynamicCartesianChart>
                {periodTooltip && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.chartTooltip,
                            {
                                backgroundColor: isDark ? colors.backgroundSelected : '#fff',
                                borderColor: colors.backgroundElement,
                                left: Math.max(4, periodTooltip.left - 46),
                                top: Math.max(0, periodTooltip.top - 50),
                            },
                        ]}
                    >
                        <ThemedText style={styles.chartTooltipPeriod}>
                            {formatPeriodLabel(periodTooltip.period, granularity)}
                        </ThemedText>
                        <ThemedText style={[styles.chartTooltipValue, { color: colors.tint }]}>
                            {periodTooltip.count} análises
                        </ThemedText>
                    </View>
                )}
            </View>
            {periodSeries.length > 0 && (
                <View style={styles.chartAxisRow}>
                    <ThemedText style={[styles.chartAxisLabel, { color: colors.textSecondary }]}>
                        {formatPeriodLabel(periodSeries[0].period, granularity)}
                    </ThemedText>
                    <ThemedText style={[styles.chartAxisLabel, { color: colors.textSecondary }]}>
                        {formatPeriodLabel(periodSeries[periodSeries.length - 1].period, granularity)}
                    </ThemedText>
                </View>
            )}
        </View>
    );
}

interface IncidenceChartCardProps {
    incidenceSeries: { data: Record<string, string | number>[]; keys: string[] };
    seriesNameById: Map<string, string>;
    byDiseaseCount: number;
    diseasePeakPeriods: DiseasePeak[];
    granularity: AnalyticsGranularity;
    colors: ThemePalette;
    isDark: boolean;
}

export function IncidenceChartCard({
    incidenceSeries,
    seriesNameById,
    byDiseaseCount,
    diseasePeakPeriods,
    granularity,
    colors,
    isDark,
}: IncidenceChartCardProps) {
    const incidencePress = useChartPressState({
        x: '',
        y: incidenceSeries.keys.reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {} as Record<string, number>),
    });
    const [incidenceTooltip, setIncidenceTooltip] = useState<{
        index: number;
        left: number;
        period: string;
        values: { key: string; count: number; top: number }[];
    } | null>(null);

    const handleIncidenceTooltipRelease = (data: {
        index: number;
        left: number;
        period: string;
        values: { key: string; count: number; top: number }[];
    }) => {
        setIncidenceTooltip((existing) => (existing && existing.index === data.index ? null : data));
    };

    useAnimatedReaction(
        () => {
            const values: { key: string; count: number; top: number }[] = [];
            for (const key of incidenceSeries.keys) {
                const entry = incidencePress.state.y[key];
                if (entry) {
                    values.push({ key, count: entry.value.value, top: entry.position.value });
                }
            }
            return {
                active: incidencePress.state.isActive.value,
                index: incidencePress.state.matchedIndex.value,
                left: incidencePress.state.x.position.value,
                period: incidencePress.state.x.value.value,
                values,
            };
        },
        (curr, prev) => {
            if (!curr.active && prev?.active) {
                runOnJS(handleIncidenceTooltipRelease)(prev);
            }
        },
    );

    return (
        <View style={[styles.chartCard, { marginTop: 22 }]}>
            <ThemedText style={styles.diseasesTitle}>Incidência de Doenças por Período</ThemedText>
            <ThemedText style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                {`As ${Math.min(5, byDiseaseCount)} doenças mais frequentes, comparadas período a período`}
            </ThemedText>

            {incidenceSeries.data.length === 0 ? (
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary, marginTop: 16 }]}>
                    Nenhuma doença identificada no período.
                </ThemedText>
            ) : (
                <>
                    <View style={styles.chartArea}>
                        <DynamicCartesianChart
                            data={incidenceSeries.data}
                            xKey="period"
                            yKeys={incidenceSeries.keys}
                            domain={{ y: [0] }}
                            domainPadding={{ top: 16, bottom: 4 }}
                            chartPressState={incidencePress.state}
                        >
                            {({ points }) => (
                                <>
                                    {incidenceSeries.keys.map((key, index) => {
                                        const color = key === 'other'
                                            ? OTHER_HUE
                                            : CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];
                                        return (
                                            <React.Fragment key={key}>
                                                <Line
                                                    points={points[key]}
                                                    color={color}
                                                    strokeWidth={2}
                                                    curveType="natural"
                                                />
                                                {/* Sem isso, uma doença com poucos
                                                    registros (linha de 1-2 pontos)
                                                    fica invisível, já que o d3 não
                                                    traça segmento com menos de 2
                                                    pontos. */}
                                                <Scatter points={points[key]} color={color} radius={4} />
                                            </React.Fragment>
                                        );
                                    })}
                                    {incidenceTooltip?.values.map((v) => {
                                        const seriesIndex = incidenceSeries.keys.indexOf(v.key);
                                        const color = v.key === 'other'
                                            ? OTHER_HUE
                                            : CATEGORICAL_PALETTE[seriesIndex % CATEGORICAL_PALETTE.length];
                                        return (
                                            <Circle
                                                key={v.key}
                                                cx={incidenceTooltip.left}
                                                cy={v.top}
                                                r={5}
                                                color={color}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </DynamicCartesianChart>
                        {incidenceTooltip && (
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.chartTooltip,
                                    styles.chartTooltipMulti,
                                    {
                                        backgroundColor: isDark ? colors.backgroundSelected : '#fff',
                                        borderColor: colors.backgroundElement,
                                        left: Math.max(4, incidenceTooltip.left - 60),
                                    },
                                ]}
                            >
                                <ThemedText style={styles.chartTooltipPeriod}>
                                    {formatPeriodLabel(incidenceTooltip.period, granularity)}
                                </ThemedText>
                                {incidenceTooltip.values.map((v) => (
                                    <ThemedText
                                        key={v.key}
                                        style={[styles.chartTooltipValue, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {seriesNameById.get(v.key) ?? v.key}: {v.count}
                                    </ThemedText>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Legenda */}
                    <View style={styles.legendWrap}>
                        {incidenceSeries.keys.map((key, index) => (
                            <View key={key} style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendSwatch,
                                        {
                                            backgroundColor:
                                                key === 'other'
                                                    ? OTHER_HUE
                                                    : CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length],
                                        },
                                    ]}
                                />
                                <ThemedText
                                    style={[styles.legendLabel, { color: colors.textSecondary }]}
                                    numberOfLines={1}
                                >
                                    {seriesNameById.get(key) ?? key}
                                </ThemedText>
                            </View>
                        ))}
                    </View>

                    {/* Períodos de pico */}
                    {diseasePeakPeriods.length > 0 && (
                        <View style={styles.peakList}>
                            {diseasePeakPeriods.map((peak) => (
                                <View key={peak.sicknessId} style={styles.peakRow}>
                                    <ThemedText style={styles.peakName} numberOfLines={1}>
                                        {sicknessLabel(peak.sicknessName)}
                                    </ThemedText>
                                    <ThemedText style={[styles.peakPeriod, { color: colors.textSecondary }]}>
                                        {formatPeriodLabel(peak.period, granularity)}
                                    </ThemedText>
                                    <ThemedText style={styles.peakCount}>{peak.count}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}
