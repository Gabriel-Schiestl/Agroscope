import React, { useState } from 'react';
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
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChatModal } from '@/components/chat-modal';
import { useAuth } from '@/contexts/auth-context';
import { useLimit } from '@/hooks/use-limit';
import api from '@/shared/http/http.config';
import type { History } from '@/models/History';

const ANALYSIS_HISTORY: History[] = [
    {
        id: '1',
        createdAt: new Date('2024-04-15'),
        crop: 'Soja',
        cropConfidence: 95.0,
        sicknessId: 'sid-ferrugem-asiatica',
        sicknessConfidence: 92.5,
        handling:
            'Aplicar fungicida triazol nas primeiras horas da manhã. Respeitar o intervalo de segurança de 14 dias.',
        explanation:
            'Ferrugem Asiática identificada na folhagem. Lesões de coloração marrom-avermelhada características.',
        causes:
            'Alta umidade relativa (acima de 85%) e temperatura entre 18°C e 26°C.',
        image: '',
    },
    {
        id: '2',
        createdAt: new Date('2024-04-10'),
        crop: 'Milho',
        cropConfidence: 88.0,
        sicknessId: 'sid-mancha-cercospora',
        sicknessConfidence: 88.7,
        handling:
            'Utilizar híbridos resistentes e aplicação preventiva de fungicida na fase vegetativa.',
        explanation:
            'Mancha de Cercospora identificada nas folhas. Lesões retangulares cinza-palha típicas.',
        causes:
            'Alta umidade e temperaturas entre 22°C e 30°C. Plantio adensado favorece a disseminação.',
        image: '',
    },
    {
        id: '3',
        createdAt: new Date('2024-04-05'),
        crop: 'Café',
        cropConfidence: 97.0,
        sicknessId: 'sid-ferrugem-cafeeiro',
        sicknessConfidence: 95.2,
        handling:
            'Aplicar fungicidas sistêmicos à base de triazol. Realizar podas para melhorar a aeração.',
        explanation:
            'Ferrugem do Cafeeiro identificada. Pústulas alaranjadas na face inferior das folhas.',
        causes:
            'Temperatura entre 20°C e 25°C e períodos prolongados de molhamento foliar.',
        image: '',
    },
];

const DISEASES_STATS = [
    { name: 'Ferrugem Asiática', pct: 38 },
    { name: 'Mancha de Cercospora', pct: 24 },
    { name: 'Ferrugem do Cafeeiro', pct: 18 },
    { name: 'Antracnose', pct: 12 },
    { name: 'Outras', pct: 8 },
];

export default function AnalyticsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const router = useRouter();
    const { auth, logout } = useAuth();
    const { limit, refetch: refetchLimit } = useLimit();

    const [file, setFile] = useState<ImagePicker.ImagePickerAsset | undefined>();
    const [result, setResult] = useState<History | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'analysis' | 'history' | 'stats'>('analysis');
    const [chatAnalysis, setChatAnalysis] = useState<History | null>(null);

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
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
                `${apiUrl}/predict`,
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

    const isDark = colorScheme === 'dark';

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
                                            style={[
                                                styles.resultLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Cultura Identificada
                                        </ThemedText>
                                        <View style={styles.resultRow}>
                                            <ThemedText
                                                style={[
                                                    styles.resultValue,
                                                    { color: colors.tint },
                                                ]}
                                            >
                                                {result.crop}
                                            </ThemedText>
                                            {result.cropConfidence > 0 && (
                                                <View
                                                    style={[
                                                        styles.badge,
                                                        {
                                                            backgroundColor:
                                                                colors.tint,
                                                        },
                                                    ]}
                                                >
                                                    <ThemedText
                                                        style={styles.badgeText}
                                                    >
                                                        {result.cropConfidence.toFixed(
                                                            1,
                                                        )}
                                                        % confiança
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Diagnóstico */}
                                    {result.explanation && (
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
                                                <View style={styles.resultRow}>
                                                    <ThemedText
                                                        style={[
                                                            styles.resultLabel,
                                                            {
                                                                color: colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        Diagnóstico
                                                    </ThemedText>
                                                    {result.sicknessConfidence &&
                                                        result.sicknessConfidence >
                                                            0 && (
                                                            <View
                                                                style={[
                                                                    styles.badgeOutline,
                                                                    {
                                                                        borderColor:
                                                                            colors.tint,
                                                                    },
                                                                ]}
                                                            >
                                                                <ThemedText
                                                                    style={[
                                                                        styles.badgeOutlineText,
                                                                        {
                                                                            color: colors.tint,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {result.sicknessConfidence.toFixed(
                                                                        1,
                                                                    )}
                                                                    %
                                                                </ThemedText>
                                                            </View>
                                                        )}
                                                </View>
                                                <ThemedText
                                                    style={[
                                                        styles.resultBody,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {result.explanation}
                                                </ThemedText>
                                            </View>
                                        </>
                                    )}

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
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <ThemedText style={styles.cardTitle}>
                                Histórico de Análises
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.cardDescription,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Análises realizadas anteriormente
                            </ThemedText>

                            {ANALYSIS_HISTORY.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <ThemedText style={{ fontSize: 40, marginBottom: 12 }}>
                                        🌿
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.emptyText,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Nenhuma análise realizada ainda. Faça
                                        sua primeira análise!
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.historyList}>
                                    {ANALYSIS_HISTORY.map((item, idx) => (
                                        <View
                                            key={item.id}
                                            style={[
                                                styles.historyItem,
                                                idx <
                                                    ANALYSIS_HISTORY.length -
                                                        1 && {
                                                    borderBottomWidth: 1,
                                                    borderBottomColor:
                                                        colors.backgroundSelected,
                                                },
                                            ]}
                                        >
                                            <View style={styles.historyMain}>
                                                <ThemedText
                                                    style={styles.historyTitle}
                                                    numberOfLines={2}
                                                >
                                                    {item.explanation ||
                                                        item.crop}
                                                </ThemedText>
                                                <ThemedText
                                                    style={[
                                                        styles.historyCrop,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    Cultura: {item.crop}
                                                </ThemedText>
                                                <ThemedText
                                                    style={[
                                                        styles.historyDate,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {new Date(
                                                        item.createdAt,
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                    )}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.historyBadges}>
                                                {item.cropConfidence > 0 && (
                                                    <View
                                                        style={[
                                                            styles.badge,
                                                            {
                                                                backgroundColor:
                                                                    colors.tint,
                                                            },
                                                        ]}
                                                    >
                                                        <ThemedText
                                                            style={
                                                                styles.badgeText
                                                            }
                                                        >
                                                            {item.cropConfidence.toFixed(
                                                                1,
                                                            )}
                                                            %
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {item.sicknessConfidence &&
                                                    item.sicknessConfidence >
                                                        0 && (
                                                        <View
                                                            style={[
                                                                styles.badgeOutline,
                                                                {
                                                                    borderColor:
                                                                        colors.tint,
                                                                },
                                                            ]}
                                                        >
                                                            <ThemedText
                                                                style={[
                                                                    styles.badgeOutlineText,
                                                                    {
                                                                        color: colors.tint,
                                                                    },
                                                                ]}
                                                            >
                                                                {item.sicknessConfidence.toFixed(
                                                                    1,
                                                                )}
                                                                %
                                                            </ThemedText>
                                                        </View>
                                                    )}
                                                <TouchableOpacity
                                                    style={[
                                                        styles.historyChatBtn,
                                                        {
                                                            backgroundColor:
                                                                colors.tint + '18',
                                                            borderColor:
                                                                colors.tint + '50',
                                                        },
                                                    ]}
                                                    onPress={() => setChatAnalysis(item)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.historyChatBtnText,
                                                            { color: colors.tint },
                                                        ]}
                                                    >
                                                        💬 Chat
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
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

                            {/* Stat cards */}
                            <View style={styles.statsGrid}>
                                {[
                                    {
                                        label: 'Total de Análises',
                                        value: '24',
                                        change: '+8 este mês',
                                    },
                                    {
                                        label: 'Culturas Analisadas',
                                        value: '5',
                                        change: 'Soja, Milho, Café...',
                                    },
                                    {
                                        label: 'Confiança Média',
                                        value: '89.4%',
                                        change: '+2.1% desde o último mês',
                                    },
                                ].map((stat) => (
                                    <ThemedView
                                        key={stat.label}
                                        type="background"
                                        style={[
                                            styles.statCard,
                                            {
                                                borderColor:
                                                    colors.backgroundElement,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.statLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            {stat.label}
                                        </ThemedText>
                                        <ThemedText style={styles.statValue}>
                                            {stat.value}
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.statChange,
                                                { color: colors.tint },
                                            ]}
                                        >
                                            {stat.change}
                                        </ThemedText>
                                    </ThemedView>
                                ))}
                            </View>

                            {/* Diseases list */}
                            <ThemedText
                                style={[
                                    styles.diseasesTitle,
                                    { marginBottom: 14 },
                                ]}
                            >
                                Doenças Mais Frequentes
                            </ThemedText>
                            <View style={styles.diseasesList}>
                                {DISEASES_STATS.map((d) => (
                                    <View key={d.name} style={styles.diseaseItem}>
                                        <View style={styles.diseaseHeader}>
                                            <ThemedText
                                                style={styles.diseaseName}
                                            >
                                                {d.name}
                                            </ThemedText>
                                            <ThemedText
                                                style={[
                                                    styles.diseasePct,
                                                    { color: colors.textSecondary },
                                                ]}
                                            >
                                                {d.pct}%
                                            </ThemedText>
                                        </View>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                {
                                                    backgroundColor:
                                                        colors.backgroundSelected,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${d.pct}%`,
                                                        backgroundColor:
                                                            colors.tint,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ThemedView>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <ChatModal
                visible={chatAnalysis !== null}
                analysis={chatAnalysis}
                onClose={() => setChatAnalysis(null)}
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
    chatBtn: {
        marginTop: 6,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    chatBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    historyChatBtn: {
        marginTop: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    historyChatBtnText: { fontSize: 11, fontWeight: '600' },
});
