import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    useColorScheme,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CartesianChart, Area, Line } from 'victory-native';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChatModal } from '@/components/chat-modal';
import { AnalysisDetailModal } from '@/components/analysis-detail-modal';
import { useAuth } from '@/contexts/auth-context';
import { useLimit } from '@/hooks/use-limit';
import { useAnalytics, type AnalyticsRangePreset } from '@/hooks/use-analytics';
import { formatCompactNumber, formatPeriodLabel } from '@/lib/utils';
import api from '@/shared/http/http.config';
import type { History } from '@/models/History';
import type { AnalyticsGranularity } from '@/models/Analytics';
import { generateAnalysisReportPdf } from '@/lib/pdf/generate-analysis-report';
import { hasPlanFeature, PLAN_FEATURE_REPORT_GENERATION } from '@/lib/plan-features';
import { cropLabel, sicknessLabel } from '@/lib/agro-labels';

const SEQUENTIAL_HUE = '#4CAF50';
const CATEGORICAL_PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
const OTHER_HUE = '#898781';
const BAR_CHART_DISPLAY_LIMIT = 7;
const OTHER_BUCKET_LABEL = 'Outras';

const RANGE_OPTIONS: { value: AnalyticsRangePreset; label: string }[] = [
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '365d', label: '12 meses' },
    { value: 'all', label: 'Tudo' },
];

const GRANULARITY_OPTIONS: { value: AnalyticsGranularity; label: string }[] = [
    { value: 'day', label: 'Diário' },
    { value: 'week', label: 'Semanal' },
    { value: 'month', label: 'Mensal' },
];

interface RankedBar {
    name: string;
    count: number;
}

// A "Incidência de Doenças por Período" tem uma série por doença, cujas chaves
// (sicknessId) só são conhecidas em tempo de execução — o CartesianChart não
// consegue tipar genericamente um conjunto dinâmico de yKeys, então usamos um
// wrapper com tipos relaxados apenas para esse gráfico multi-série.
const DynamicCartesianChart = CartesianChart as unknown as React.ComponentType<{
    data: Record<string, string | number>[];
    xKey: string;
    yKeys: string[];
    children: (args: {
        points: Record<string, import('victory-native').PointsArray>;
    }) => React.ReactNode;
}>;

function foldTopN(items: RankedBar[], limit: number): RankedBar[] {
    if (items.length <= limit) return items;
    const top = items.slice(0, limit);
    const otherCount = items
        .slice(limit)
        .reduce((sum, item) => sum + item.count, 0);
    return [...top, { name: OTHER_BUCKET_LABEL, count: otherCount }];
}

export default function AnalyticsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const router = useRouter();
    const { auth, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const { limit, refetch: refetchLimit } = useLimit();
    const canGenerateReport = hasPlanFeature(
        limit?.featureFlags,
        PLAN_FEATURE_REPORT_GENERATION,
    );

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/');
        }
    }, [authLoading, isAuthenticated, router]);

    const [file, setFile] = useState<ImagePicker.ImagePickerAsset | undefined>();
    const [result, setResult] = useState<History | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'analysis' | 'history' | 'stats'>('analysis');
    const [chatAnalysis, setChatAnalysis] = useState<History | null>(null);
    const [detailAnalysis, setDetailAnalysis] = useState<History | null>(null);
    const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);

    const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRangePreset>('90d');
    const [analyticsGranularity, setAnalyticsGranularity] = useState<AnalyticsGranularity>('month');
    const { analytics, isLoading: analyticsLoading } = useAnalytics(
        analyticsRange,
        analyticsGranularity,
    );

    const diseaseBars = useMemo<RankedBar[]>(() => {
        if (!analytics) return [];
        return foldTopN(
            analytics.byDisease.map((d) => ({ name: d.sicknessName, count: d.count })),
            BAR_CHART_DISPLAY_LIMIT,
        );
    }, [analytics]);

    const cropBars = useMemo<RankedBar[]>(() => {
        if (!analytics) return [];
        return foldTopN(
            analytics.byCrop.map((c) => ({ name: c.crop, count: c.count })),
            BAR_CHART_DISPLAY_LIMIT,
        );
    }, [analytics]);

    const periodSeries = useMemo(() => {
        if (!analytics) return [];
        return analytics.byPeriod.map((p) => ({ period: p.period, count: p.count }));
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
        analytics?.diseaseIncidenceByPeriod.forEach((s) => map.set(s.sicknessId, s.sicknessName));
        return map;
    }, [analytics]);

    const renderRankedList = (items: RankedBar[], emptyLabel: string) => {
        if (items.length === 0) {
            return (
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {emptyLabel}
                </ThemedText>
            );
        }
        const maxCount = Math.max(1, ...items.map((i) => i.count));
        return (
            <View style={styles.diseasesList}>
                {items.map((item) => (
                    <View key={item.name} style={styles.diseaseItem}>
                        <View style={styles.diseaseHeader}>
                            <ThemedText style={styles.diseaseName} numberOfLines={1}>
                                {item.name}
                            </ThemedText>
                            <ThemedText style={[styles.diseasePct, { color: colors.textSecondary }]}>
                                {item.count}
                            </ThemedText>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: colors.backgroundSelected }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(item.count / maxCount) * 100}%`,
                                        backgroundColor: colors.tint,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const [historyItems, setHistoryItems] = useState<History[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [cropFilter, setCropFilter] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '3m'>('all');
    const [order, setOrder] = useState<'DESC' | 'ASC'>('DESC');

    const dateRangeToStartDate = (range: typeof dateRange): string | undefined => {
        if (range === 'all') return undefined;
        const now = new Date();
        if (range === '7d') now.setDate(now.getDate() - 7);
        else if (range === '30d') now.setDate(now.getDate() - 30);
        else if (range === '3m') now.setMonth(now.getMonth() - 3);
        return now.toISOString();
    };

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const params = new URLSearchParams();
            if (cropFilter) params.append('crop', cropFilter);
            const startDate = dateRangeToStartDate(dateRange);
            if (startDate) params.append('startDate', startDate);
            params.append('order', order);

            const response = await api.get<History[]>(
                `/history?${params.toString()}`,
            );
            setHistoryItems(response.data);
        } catch {
            Alert.alert('Erro', 'Não foi possível carregar o histórico.');
        } finally {
            setHistoryLoading(false);
        }
    }, [cropFilter, dateRange, order]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, fetchHistory]);

    const windowWidth = Dimensions.get('window').width;

    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!res.canceled) {
            setFile(res.assets[0]);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!res.canceled) {
            setFile(res.assets[0]);
            setResult(null);
        }
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const getMimeType = (uri: string): string => {
        const ext = uri.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
        };
        return mimeTypes[ext ?? ''] ?? 'image/jpeg';
    };

    const handleAnalyze = async () => {
        if (!file) return;

        if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
            Alert.alert(
                'Imagem muito grande',
                'O tamanho máximo permitido é 5MB. Por favor, selecione uma imagem menor.',
            );
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: file.uri,
                name: file.fileName || 'image.jpg',
                type: getMimeType(file.uri),
            } as any);

            const response = await api.post<History>(
                '/predict',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            if (response.status === 201) {
                setResult(response.data);
                refetchLimit();
            } else {
                Alert.alert('Erro', 'Falha na análise. Tente novamente.');
            }
        } catch (error: any) {
            const message: string =
                error?.response?.data?.message ?? 'Erro inesperado na análise.';

            const isLowConfidence = message.includes('confiança insuficiente') || message.includes('confiança suficiente');
            Alert.alert(
                isLowConfidence ? 'Imagem insuficiente' : 'Erro',
                message,
                isLowConfidence
                    ? [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                              text: 'Enviar nova imagem',
                              onPress: () => {
                                  setFile(undefined);
                                  setResult(null);
                              },
                          },
                      ]
                    : undefined,
            );
            refetchLimit();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/');
    };

    const handleGenerateReport = async (analysis: History) => {
        if (!canGenerateReport) {
            Alert.alert(
                'Recurso indisponível',
                'Relatórios em PDF estão disponíveis apenas nos planos pagos. Faça upgrade do seu plano.',
            );
            return;
        }
        setGeneratingReportId(analysis.id);
        try {
            await generateAnalysisReportPdf(analysis);
        } catch {
            Alert.alert('Erro', 'Não foi possível gerar o relatório.');
        } finally {
            setGeneratingReportId(null);
        }
    };

    const isDark = colorScheme === 'dark';

    if (authLoading || !isAuthenticated) {
        return null;
    }

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            <SafeAreaView
                style={{ backgroundColor: colors.background }}
                edges={['top']}
            >
                {/* Header */}
                <View
                    style={[
                        styles.header,
                        { borderBottomColor: colors.backgroundElement },
                    ]}
                >
                    <ThemedText
                        style={[styles.brand, { color: colors.tint }]}
                    >
                        AgroScope
                    </ThemedText>
                    <View style={styles.headerRight}>
                        {auth?.name ? (
                            <ThemedText
                                style={[
                                    styles.userName,
                                    { color: colors.textSecondary },
                                ]}
                                numberOfLines={1}
                            >
                                {auth.name}
                            </ThemedText>
                        ) : null}
                        <TouchableOpacity
                            style={[
                                styles.logoutBtn,
                                { borderColor: colors.backgroundElement },
                            ]}
                            onPress={() => router.push('/plans')}
                        >
                            <ThemedText
                                style={[
                                    styles.logoutBtnText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                💳 Planos
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.logoutBtn,
                                { borderColor: colors.backgroundElement },
                            ]}
                            onPress={handleLogout}
                        >
                            <ThemedText
                                style={[
                                    styles.logoutBtnText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Sair
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Title */}
                <View style={styles.pageTitle}>
                    <ThemedText style={styles.title}>
                        Análise de Plantas
                    </ThemedText>
                    <ThemedText
                        style={[
                            styles.subtitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Diagnóstico de doenças e recomendações de manejo
                    </ThemedText>
                </View>

                {/* Tabs */}
                <View
                    style={[
                        styles.tabsContainer,
                        { borderBottomColor: colors.backgroundElement },
                    ]}
                >
                    {(
                        [
                            { key: 'analysis', label: 'Nova Análise' },
                            { key: 'history', label: 'Histórico' },
                            { key: 'stats', label: 'Estatísticas' },
                        ] as const
                    ).map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                activeTab === tab.key && [
                                    styles.activeTab,
                                    { borderBottomColor: colors.tint },
                                ],
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && {
                                        color: colors.tint,
                                        fontWeight: '600',
                                    },
                                ]}
                            >
                                {tab.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── NOVA ANÁLISE ── */}
                {activeTab === 'analysis' && (
                    <View style={styles.content}>
                        {/* Upload Card */}
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <ThemedText style={styles.cardTitle}>
                                Upload de Imagem
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.cardDescription,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Selecione uma imagem clara da planta para análise
                            </ThemedText>

                            {/* Preview */}
                            <View
                                style={[
                                    styles.imagePreview,
                                    {
                                        backgroundColor: isDark
                                            ? colors.backgroundSelected
                                            : colors.backgroundElement,
                                    },
                                ]}
                            >
                                {file ? (
                                    <Image
                                        source={{ uri: file.uri }}
                                        style={{
                                            width: '100%',
                                            height: windowWidth * 0.55,
                                        }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={styles.placeholderInner}>
                                        <View
                                            style={[
                                                styles.placeholderIcon,
                                                {
                                                    backgroundColor:
                                                        colors.tint + '20',
                                                },
                                            ]}
                                        >
                                            <ThemedText
                                                style={{ fontSize: 28 }}
                                            >
                                                📷
                                            </ThemedText>
                                        </View>
                                        <ThemedText
                                            style={[
                                                styles.placeholderText,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Nenhuma imagem selecionada
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {file && (
                                <ThemedText
                                    style={[
                                        styles.fileName,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {file.fileName || 'imagem.jpg'}
                                </ThemedText>
                            )}

                            {/* Capture buttons */}
                            <View style={styles.captureRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.captureBtn,
                                        { backgroundColor: colors.tint },
                                    ]}
                                    onPress={pickImage}
                                >
                                    <ThemedText style={styles.captureBtnText}>
                                        🖼  Galeria
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.captureBtn,
                                        { backgroundColor: colors.tint },
                                    ]}
                                    onPress={takePhoto}
                                >
                                    <ThemedText style={styles.captureBtnText}>
                                        📷  Câmera
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            {/* Usage counter */}
                            {limit && (
                                <ThemedText
                                    style={[
                                        styles.usageCounter,
                                        {
                                            color:
                                                limit.imageRequests >= limit.imageLimit
                                                    ? '#ef4444'
                                                    : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {`Análises: ${limit.imageRequests}/${limit.imageLimit}`}
                                </ThemedText>
                            )}

                            {/* Analyze button */}
                            <TouchableOpacity
                                style={[
                                    styles.analyzeBtn,
                                    { backgroundColor: colors.tint },
                                    (!file || loading || (limit !== null && limit.imageRequests >= limit.imageLimit)) && { opacity: 0.5 },
                                ]}
                                onPress={handleAnalyze}
                                disabled={!file || loading || (limit !== null && limit.imageRequests >= limit.imageLimit)}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.analyzeBtnText}>
                                        🔍  Analisar Imagem
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        </ThemedView>

                        {/* Empty state */}
                        {!result && !loading && (
                            <ThemedView
                                type="backgroundElement"
                                style={[
                                    styles.card,
                                    { borderColor: colors.backgroundElement },
                                ]}
                            >
                                <ThemedText style={styles.cardTitle}>
                                    Resultado da Análise
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.cardDescription,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Diagnóstico e recomendações de manejo
                                </ThemedText>
                                <View style={styles.emptyState}>
                                    <ThemedText style={{ fontSize: 44, marginBottom: 12 }}>
                                        🌿
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.emptyText,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Selecione uma imagem e clique em
                                        "Analisar Imagem" para obter o
                                        diagnóstico.
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <ThemedView
                                type="backgroundElement"
                                style={[
                                    styles.card,
                                    { borderColor: colors.backgroundElement },
                                ]}
                            >
                                <View style={styles.loadingState}>
                                    <ActivityIndicator
                                        size="large"
                                        color={colors.tint}
                                    />
                                    <ThemedText
                                        style={[
                                            styles.loadingText,
                                            { marginTop: 16 },
                                        ]}
                                    >
                                        Analisando a imagem...
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.loadingSubtext,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Isso pode levar alguns segundos.
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        )}

                        {/* Result */}
                        {result && (
                            <ThemedView
                                type="backgroundElement"
                                style={[
                                    styles.card,
                                    { borderColor: colors.backgroundElement },
                                ]}
                            >
                                <ThemedText style={styles.cardTitle}>
                                    Resultado da Análise
                                </ThemedText>

                                <View style={styles.resultSection}>
                                    {/* Cultura */}
                                    <View>
                                        <ThemedText
                                            style={[styles.resultLabel, { color: colors.textSecondary }]}
                                        >
                                            Cultura Identificada
                                        </ThemedText>
                                        <View style={styles.resultRow}>
                                            <ThemedText style={[styles.resultValue, { color: colors.tint }]}>
                                                {cropLabel(result.crop)}
                                            </ThemedText>
                                            {result.cropConfidence > 0 && (
                                                <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                                    <ThemedText style={styles.badgeText}>
                                                        {(result.cropConfidence * 100).toFixed(1)}% confiança
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Diagnóstico */}
                                    <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />
                                    <View>
                                        <View style={styles.resultRow}>
                                            <ThemedText style={[styles.resultLabel, { color: colors.textSecondary }]}>
                                                Diagnóstico
                                            </ThemedText>
                                            {result.sicknessId && result.sicknessConfidence != null && result.sicknessConfidence > 0 && (
                                                <View style={[styles.badgeOutline, { borderColor: colors.tint }]}>
                                                    <ThemedText style={[styles.badgeOutlineText, { color: colors.tint }]}>
                                                        {(result.sicknessConfidence * 100).toFixed(1)}%
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </View>
                                        {!result.sicknessId ? (
                                            <View style={[styles.badge, { backgroundColor: colors.tint, alignSelf: 'flex-start' }]}>
                                                <ThemedText style={styles.badgeText}>🌿 Planta Saudável</ThemedText>
                                            </View>
                                        ) : (
                                            <>
                                                {result.sicknessName && (
                                                    <ThemedText style={[styles.resultBody, { fontWeight: '600' }]}>
                                                        {sicknessLabel(result.sicknessName)}
                                                    </ThemedText>
                                                )}
                                                {result.explanation && (
                                                    <ThemedText style={[styles.resultBody, { color: colors.textSecondary }]}>
                                                        {result.explanation}
                                                    </ThemedText>
                                                )}
                                            </>
                                        )}
                                    </View>

                                    {/* Causas */}
                                    {result.causes && (
                                        <>
                                            <View
                                                style={[
                                                    styles.divider,
                                                    {
                                                        backgroundColor:
                                                            colors.backgroundSelected,
                                                    },
                                                ]}
                                            />
                                            <View>
                                                <ThemedText
                                                    style={[
                                                        styles.resultLabel,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    Causas
                                                </ThemedText>
                                                <ThemedText
                                                    style={[
                                                        styles.resultBody,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {result.causes}
                                                </ThemedText>
                                            </View>
                                        </>
                                    )}

                                    <View
                                        style={[
                                            styles.divider,
                                            {
                                                backgroundColor:
                                                    colors.backgroundSelected,
                                            },
                                        ]}
                                    />

                                    {/* Manejo */}
                                    <View>
                                        <ThemedText
                                            style={[
                                                styles.resultLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Recomendações de Manejo
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.resultBody,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            {result.handling}
                                        </ThemedText>
                                    </View>

                                    {/* Alert */}
                                    <View
                                        style={[
                                            styles.alertBox,
                                            {
                                                backgroundColor:
                                                    colors.tint + '15',
                                                borderColor:
                                                    colors.tint + '40',
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.alertTitle,
                                                { color: colors.tint },
                                            ]}
                                        >
                                            ⚠️  Importante
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.alertBody,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Consulte um agrônomo para confirmar
                                            o diagnóstico e obter recomendações
                                            específicas para sua lavoura.
                                        </ThemedText>
                                    </View>

                                    {/* Chat */}
                                    <TouchableOpacity
                                        style={[
                                            styles.chatBtn,
                                            { backgroundColor: colors.tint },
                                        ]}
                                        onPress={() => setChatAnalysis(result)}
                                    >
                                        <ThemedText style={styles.chatBtnText}>
                                            💬  Tirar dúvidas sobre esta análise
                                        </ThemedText>
                                    </TouchableOpacity>

                                    {/* PDF report */}
                                    <TouchableOpacity
                                        style={[
                                            styles.reportBtn,
                                            { borderColor: colors.tint },
                                            (generatingReportId === result.id || !canGenerateReport) && { opacity: 0.6 },
                                        ]}
                                        onPress={() => handleGenerateReport(result)}
                                        disabled={generatingReportId === result.id || !canGenerateReport}
                                    >
                                        {generatingReportId === result.id ? (
                                            <ActivityIndicator color={colors.tint} />
                                        ) : (
                                            <ThemedText style={[styles.reportBtnText, { color: colors.tint }]}>
                                                📄  Gerar Relatório PDF
                                            </ThemedText>
                                        )}
                                    </TouchableOpacity>
                                    {!canGenerateReport && (
                                        <ThemedText
                                            style={[styles.reportLockedText, { color: colors.textSecondary }]}
                                        >
                                            Disponível nos planos pagos. Faça upgrade para gerar relatórios.
                                        </ThemedText>
                                    )}
                                </View>
                            </ThemedView>
                        )}

                        {/* Tips */}
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <ThemedText style={styles.cardTitle}>
                                Dicas para Melhores Resultados
                            </ThemedText>
                            <View style={styles.tipsGrid}>
                                {[
                                    {
                                        title: 'Qualidade da Imagem',
                                        desc: 'Utilize imagens nítidas e bem iluminadas. Evite sombras e reflexos.',
                                    },
                                    {
                                        title: 'Foco nos Sintomas',
                                        desc: 'Capture manchas, lesões ou descolorações visíveis na folha.',
                                    },
                                    {
                                        title: 'Múltiplas Amostras',
                                        desc: 'Analise várias imagens em diferentes ângulos para maior precisão.',
                                    },
                                ].map((tip) => (
                                    <View
                                        key={tip.title}
                                        style={[
                                            styles.tipCard,
                                            {
                                                borderColor:
                                                    colors.backgroundSelected,
                                                backgroundColor: isDark
                                                    ? colors.backgroundSelected
                                                    : colors.background,
                                            },
                                        ]}
                                    >
                                        <ThemedText style={styles.tipTitle}>
                                            {tip.title}
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.tipDesc,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            {tip.desc}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        </ThemedView>
                    </View>
                )}

                {/* ── HISTÓRICO ── */}
                {activeTab === 'history' && (
                    <View style={styles.content}>
                        <ThemedView
                            type="backgroundElement"
                            style={[styles.card, { borderColor: colors.backgroundElement }]}
                        >
                            <ThemedText style={styles.cardTitle}>
                                Histórico de Análises
                            </ThemedText>

                            {/* Filtro por cultura */}
                            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
                                Cultura
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                                {([undefined, 'corn', 'soybean', 'wheat'] as const).map((c) => {
                                    const label = c === undefined ? 'Todas' : c === 'corn' ? 'Milho' : c === 'soybean' ? 'Soja' : 'Trigo';
                                    const active = cropFilter === c;
                                    return (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                styles.filterChip,
                                                active
                                                    ? { backgroundColor: colors.tint }
                                                    : { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundElement },
                                            ]}
                                            onPress={() => setCropFilter(c)}
                                        >
                                            <ThemedText style={[styles.filterChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                                                {label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Filtro por período */}
                            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
                                Período
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                                {(['all', '7d', '30d', '3m'] as const).map((r) => {
                                    const label = r === 'all' ? 'Tudo' : r === '7d' ? '7 dias' : r === '30d' ? '30 dias' : '3 meses';
                                    const active = dateRange === r;
                                    return (
                                        <TouchableOpacity
                                            key={r}
                                            style={[
                                                styles.filterChip,
                                                active
                                                    ? { backgroundColor: colors.tint }
                                                    : { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundElement },
                                            ]}
                                            onPress={() => setDateRange(r)}
                                        >
                                            <ThemedText style={[styles.filterChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                                                {label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Ordenação */}
                            <TouchableOpacity
                                style={[styles.orderToggle, { borderColor: colors.backgroundElement }]}
                                onPress={() => setOrder((o) => (o === 'DESC' ? 'ASC' : 'DESC'))}
                            >
                                <ThemedText style={[styles.orderToggleText, { color: colors.textSecondary }]}>
                                    {order === 'DESC' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'}
                                </ThemedText>
                            </TouchableOpacity>

                            {/* Lista */}
                            {historyLoading ? (
                                <ActivityIndicator style={{ marginTop: 24 }} color={colors.tint} />
                            ) : historyItems.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <ThemedText style={{ fontSize: 40, marginBottom: 12 }}>🌿</ThemedText>
                                    <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                                        Nenhuma análise encontrada.
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.historyList}>
                                    {historyItems.map((item, idx) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.historyItem,
                                                idx < historyItems.length - 1 && {
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.backgroundSelected,
                                                },
                                            ]}
                                            onPress={() => setDetailAnalysis(item)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.historyMain}>
                                                <ThemedText style={styles.historyTitle} numberOfLines={2}>
                                                    {item.sicknessName
                                                        ? sicknessLabel(item.sicknessName)
                                                        : item.sicknessId
                                                        ? 'Doença identificada'
                                                        : 'Planta saudável'}
                                                </ThemedText>
                                                <ThemedText style={[styles.historyCrop, { color: colors.textSecondary }]}>
                                                    Cultura: {cropLabel(item.crop)}
                                                </ThemedText>
                                                <ThemedText style={[styles.historyDate, { color: colors.textSecondary }]}>
                                                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.historyBadges}>
                                                {item.cropConfidence > 0 && (
                                                    <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                                        <ThemedText style={styles.badgeText}>
                                                            {(item.cropConfidence * 100).toFixed(1)}%
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {item.sicknessConfidence != null && item.sicknessConfidence > 0 && (
                                                    <View style={[styles.badgeOutline, { borderColor: colors.tint }]}>
                                                        <ThemedText style={[styles.badgeOutlineText, { color: colors.tint }]}>
                                                            {(item.sicknessConfidence * 100).toFixed(1)}%
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                <TouchableOpacity
                                                    style={[styles.historyChatBtn, { backgroundColor: colors.tint + '18', borderColor: colors.tint + '50' }]}
                                                    onPress={(e) => { e.stopPropagation?.(); setChatAnalysis(item); }}
                                                >
                                                    <ThemedText style={[styles.historyChatBtnText, { color: colors.tint }]}>
                                                        💬 Chat
                                                    </ThemedText>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.historyChatBtn,
                                                        { backgroundColor: colors.tint + '18', borderColor: colors.tint + '50' },
                                                        (generatingReportId === item.id || !canGenerateReport) && { opacity: 0.6 },
                                                    ]}
                                                    onPress={(e) => { e.stopPropagation?.(); handleGenerateReport(item); }}
                                                    disabled={generatingReportId === item.id}
                                                >
                                                    {generatingReportId === item.id ? (
                                                        <ActivityIndicator size="small" color={colors.tint} />
                                                    ) : (
                                                        <ThemedText style={[styles.historyChatBtnText, { color: colors.tint }]}>
                                                            📄 PDF
                                                        </ThemedText>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </ThemedView>
                    </View>
                )}

                {/* ── ESTATÍSTICAS ── */}
                {activeTab === 'stats' && (
                    <View style={styles.content}>
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <ThemedText style={styles.cardTitle}>
                                Estatísticas de Análises
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.cardDescription,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Visão geral das análises realizadas
                            </ThemedText>

                            {/* Período */}
                            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary, marginTop: 0 }]}>
                                Período
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                                {RANGE_OPTIONS.map((option) => {
                                    const active = analyticsRange === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.filterChip,
                                                active
                                                    ? { backgroundColor: colors.tint }
                                                    : { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundElement },
                                            ]}
                                            onPress={() => setAnalyticsRange(option.value)}
                                        >
                                            <ThemedText style={[styles.filterChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                                                {option.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Agrupamento */}
                            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
                                Agrupamento
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                                {GRANULARITY_OPTIONS.map((option) => {
                                    const active = analyticsGranularity === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.filterChip,
                                                active
                                                    ? { backgroundColor: colors.tint }
                                                    : { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundElement },
                                            ]}
                                            onPress={() => setAnalyticsGranularity(option.value)}
                                        >
                                            <ThemedText style={[styles.filterChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                                                {option.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {analyticsLoading ? (
                                <View style={styles.emptyState}>
                                    <ActivityIndicator color={colors.tint} />
                                    <ThemedText style={[styles.loadingSubtext, { marginTop: 10, color: colors.textSecondary }]}>
                                        Carregando estatísticas...
                                    </ThemedText>
                                </View>
                            ) : !analytics || analytics.totalAnalyses === 0 ? (
                                <View style={styles.emptyState}>
                                    <ThemedText style={{ fontSize: 40, marginBottom: 12 }}>📊</ThemedText>
                                    <ThemedText style={[styles.emptyText, { fontWeight: '600' }]}>
                                        Ainda não há dados suficientes.
                                    </ThemedText>
                                    <ThemedText style={[styles.emptyText, { color: colors.textSecondary, marginTop: 4 }]}>
                                        Faça sua primeira análise na aba &quot;Nova Análise&quot; para ver suas estatísticas aqui.
                                    </ThemedText>
                                </View>
                            ) : (
                                <>
                                    {/* Stat cards */}
                                    <View style={[styles.statsGrid, { marginTop: 18 }]}>
                                        {[
                                            {
                                                label: 'Total de Análises',
                                                value: formatCompactNumber(analytics.totalAnalyses),
                                                change: analytics.peakPeriod
                                                    ? `Pico em ${formatPeriodLabel(analytics.peakPeriod.period, analytics.granularity)} (${analytics.peakPeriod.count})`
                                                    : undefined,
                                            },
                                            {
                                                label: 'Culturas Analisadas',
                                                value: String(analytics.distinctCropsCount),
                                                change: analytics.byCrop.map((c) => c.crop).slice(0, 4).join(', ') || undefined,
                                            },
                                            {
                                                label: 'Doenças Detectadas',
                                                value: String(analytics.distinctDiseasesCount),
                                                change: `${analytics.totalAnalyses > 0 ? Math.round((analytics.diseasedCount / analytics.totalAnalyses) * 100) : 0}% das análises com doença identificada`,
                                            },
                                            {
                                                label: 'Confiança Média',
                                                value: analytics.averageCropConfidence !== null
                                                    ? `${(analytics.averageCropConfidence * 100).toFixed(1)}%`
                                                    : '—',
                                                change: 'Confiança na identificação da cultura',
                                            },
                                        ].map((stat) => (
                                            <ThemedView
                                                key={stat.label}
                                                type="background"
                                                style={[
                                                    styles.statCard,
                                                    { borderColor: colors.backgroundElement },
                                                ]}
                                            >
                                                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                                    {stat.label}
                                                </ThemedText>
                                                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                                                {!!stat.change && (
                                                    <ThemedText
                                                        style={[styles.statChange, { color: colors.tint }]}
                                                        numberOfLines={2}
                                                    >
                                                        {stat.change}
                                                    </ThemedText>
                                                )}
                                            </ThemedView>
                                        ))}
                                    </View>

                                    {/* Análises ao longo do tempo */}
                                    <View style={styles.chartCard}>
                                        <ThemedText style={styles.diseasesTitle}>
                                            Análises ao Longo do Tempo
                                        </ThemedText>
                                        <ThemedText style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                                            Volume de análises por período selecionado
                                        </ThemedText>
                                        <View style={styles.chartArea}>
                                            <CartesianChart data={periodSeries} xKey="period" yKeys={['count']}>
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
                                                    </>
                                                )}
                                            </CartesianChart>
                                        </View>
                                        {periodSeries.length > 0 && (
                                            <View style={styles.chartAxisRow}>
                                                <ThemedText style={[styles.chartAxisLabel, { color: colors.textSecondary }]}>
                                                    {formatPeriodLabel(periodSeries[0].period, analytics.granularity)}
                                                </ThemedText>
                                                <ThemedText style={[styles.chartAxisLabel, { color: colors.textSecondary }]}>
                                                    {formatPeriodLabel(periodSeries[periodSeries.length - 1].period, analytics.granularity)}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    {/* Doenças mais frequentes */}
                                    <ThemedText style={[styles.diseasesTitle, { marginTop: 4, marginBottom: 14 }]}>
                                        Doenças Mais Frequentes
                                    </ThemedText>
                                    {renderRankedList(diseaseBars, 'Nenhuma doença identificada no período.')}

                                    {/* Análises por cultura */}
                                    <ThemedText style={[styles.diseasesTitle, { marginTop: 22, marginBottom: 14 }]}>
                                        Análises por Cultura
                                    </ThemedText>
                                    {renderRankedList(cropBars, 'Nenhuma cultura registrada no período.')}

                                    {/* Incidência de doenças por período */}
                                    <View style={[styles.chartCard, { marginTop: 22 }]}>
                                        <ThemedText style={styles.diseasesTitle}>
                                            Incidência de Doenças por Período
                                        </ThemedText>
                                        <ThemedText style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                                            {`As ${Math.min(5, analytics.byDisease.length)} doenças mais frequentes, comparadas período a período`}
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
                                                    >
                                                        {({ points }) => (
                                                            <>
                                                                {incidenceSeries.keys.map((key, index) => (
                                                                    <Line
                                                                        key={key}
                                                                        points={points[key]}
                                                                        color={
                                                                            key === 'other'
                                                                                ? OTHER_HUE
                                                                                : CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
                                                                        }
                                                                        strokeWidth={2}
                                                                        curveType="natural"
                                                                    />
                                                                ))}
                                                            </>
                                                        )}
                                                    </DynamicCartesianChart>
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
                                                {analytics.diseasePeakPeriods.length > 0 && (
                                                    <View style={styles.peakList}>
                                                        {analytics.diseasePeakPeriods.map((peak) => (
                                                            <View key={peak.sicknessId} style={styles.peakRow}>
                                                                <ThemedText style={styles.peakName} numberOfLines={1}>
                                                                    {peak.sicknessName}
                                                                </ThemedText>
                                                                <ThemedText style={[styles.peakPeriod, { color: colors.textSecondary }]}>
                                                                    {formatPeriodLabel(peak.period, analytics.granularity)}
                                                                </ThemedText>
                                                                <ThemedText style={styles.peakCount}>{peak.count}</ThemedText>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </View>
                                </>
                            )}
                        </ThemedView>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <ChatModal
                visible={chatAnalysis !== null}
                analysis={chatAnalysis}
                onClose={() => setChatAnalysis(null)}
                limit={limit}
            />

            <AnalysisDetailModal
                visible={detailAnalysis !== null}
                analysis={detailAnalysis}
                onClose={() => setDetailAnalysis(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderBottomWidth: 1,
    },
    brand: { fontSize: 18, fontWeight: '700' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    userName: { fontSize: 13, maxWidth: 120 },
    logoutBtn: {
        borderWidth: 1,
        borderRadius: 7,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    logoutBtnText: { fontSize: 13 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    pageTitle: { marginTop: 16, marginBottom: 4 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 13 },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginTop: 14,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 11,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomWidth: 2 },
    tabText: { fontSize: 13 },
    content: { gap: 0 },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    cardDescription: { fontSize: 13, marginBottom: 14 },
    imagePreview: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
        minHeight: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderInner: { alignItems: 'center', paddingVertical: 32 },
    placeholderIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    placeholderText: { fontSize: 13 },
    fileName: { fontSize: 11, marginBottom: 10 },
    captureRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    captureBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    captureBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    usageCounter: { fontSize: 11, textAlign: 'right', marginBottom: 6 },
    analyzeBtn: { paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
    analyzeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    emptyState: { paddingVertical: 32, alignItems: 'center' },
    emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    loadingState: { paddingVertical: 40, alignItems: 'center' },
    loadingText: { fontSize: 15, fontWeight: '500' },
    loadingSubtext: { fontSize: 12, marginTop: 6 },
    resultSection: { gap: 14 },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    resultLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
    resultValue: { fontSize: 17, fontWeight: '600' },
    resultBody: { fontSize: 13, lineHeight: 20, marginTop: 2 },
    divider: { height: 1 },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    badgeOutline: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    badgeOutlineText: { fontSize: 11, fontWeight: '600' },
    alertBox: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        gap: 4,
    },
    alertTitle: { fontSize: 13, fontWeight: '600' },
    alertBody: { fontSize: 12, lineHeight: 18 },
    tipsGrid: { gap: 10, marginTop: 4 },
    tipCard: { borderRadius: 8, borderWidth: 1, padding: 12 },
    tipTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    tipDesc: { fontSize: 12, lineHeight: 18 },
    historyList: { marginTop: 8 },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        gap: 8,
    },
    historyMain: { flex: 1 },
    historyTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
    historyCrop: { fontSize: 12, marginBottom: 2 },
    historyDate: { fontSize: 11 },
    historyBadges: { alignItems: 'flex-end', gap: 4 },
    statsGrid: { gap: 10, marginBottom: 20 },
    statCard: { borderRadius: 8, borderWidth: 1, padding: 12 },
    statLabel: { fontSize: 12 },
    statValue: { fontSize: 26, fontWeight: '700', marginTop: 4 },
    statChange: { fontSize: 11, marginTop: 4 },
    diseasesTitle: { fontSize: 15, fontWeight: '600' },
    diseasesList: { gap: 12 },
    diseaseItem: { gap: 6 },
    diseaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diseaseName: { fontSize: 13, fontWeight: '500' },
    diseasePct: { fontSize: 12 },
    progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    chartCard: { marginTop: 22 },
    chartSubtitle: { fontSize: 12, marginTop: 2, marginBottom: 4 },
    chartArea: { height: 200, marginTop: 10 },
    chartAxisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    chartAxisLabel: { fontSize: 11 },
    legendWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 14,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 150 },
    legendSwatch: { width: 10, height: 10, borderRadius: 2 },
    legendLabel: { fontSize: 11 },
    peakList: { marginTop: 18, gap: 10 },
    peakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    peakName: { flex: 1, fontSize: 12, fontWeight: '500' },
    peakPeriod: { fontSize: 11 },
    peakCount: { fontSize: 12, fontWeight: '700', minWidth: 24, textAlign: 'right' },
    chatBtn: {
        marginTop: 6,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    chatBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    reportBtn: {
        marginTop: 6,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    reportBtnText: { fontWeight: '600', fontSize: 14 },
    reportLockedText: { fontSize: 11, textAlign: 'center', marginTop: 6 },
    historyChatBtn: {
        marginTop: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    historyChatBtnText: { fontSize: 11, fontWeight: '600' },
    filterLabel: { fontSize: 12, fontWeight: '600', marginTop: 14, marginBottom: 6 },
    filterRow: { flexDirection: 'row', marginBottom: 4 },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 8,
    },
    filterChipText: { fontSize: 12, fontWeight: '500' },
    orderToggle: {
        marginTop: 12,
        marginBottom: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    orderToggleText: { fontSize: 12, fontWeight: '500' },
});
