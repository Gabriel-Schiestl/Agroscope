import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    Image,
    Dimensions,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Toast from 'expo-toast';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/shared/http/http.config';

const ANALYSIS_HISTORY = [
    {
        id: '1',
        date: '15/04/2024',
        crop: 'Soja',
        prediction: 'Ferrugem Asiática',
        confidence: 92.5,
    },
    {
        id: '2',
        date: '10/04/2024',
        crop: 'Milho',
        prediction: 'Mancha de Cercospora',
        confidence: 88.7,
    },
    {
        id: '3',
        date: '05/04/2024',
        crop: 'Café',
        prediction: 'Ferrugem do Cafeeiro',
        confidence: 95.2,
    },
];

interface PredicResponse {
    sickness: {
        name: string;
        description: string;
        symptoms: string[];
    };
    handling: string;
    sicknessConfidence: number;
    crop: string;
    cropConfidence: number;
}

export default function AnalyticsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [file, setFile] = useState<
        ImagePicker.ImagePickerAsset | undefined
    >();
    const [result, setResult] = useState<PredicResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<
        'analysis' | 'history' | 'stats'
    >('analysis');

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0]);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0]);
            setResult(null);
        }
    };

    const handleAnalyzeClick = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: file.uri,
                name: file.fileName || 'image.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await api.post<PredicResponse>(
                `${apiUrl}/predict`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            if (response.status === 201) {
                setResult(response.data);
            } else {
                Alert.alert('Erro', 'Falha na análise. Tente novamente.');
            }
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error?.response?.data?.message || 'Erro inesperado na análise.',
            );
        } finally {
            setLoading(false);
        }
    };

    const windowWidth = Dimensions.get('window').width;
    const imageHeight = windowWidth * (3 / 4);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Análise de Plantas
                    </ThemedText>
                    <ThemedText
                        style={[styles.subtitle, { color: colors.text }]}
                    >
                        Diagnóstico de doenças e recomendações
                    </ThemedText>
                </View>

                {/* Tabs */}
                <View
                    style={[
                        styles.tabsContainer,
                        { borderBottomColor: colors.backgroundElement },
                    ]}
                >
                    {(['analysis', 'history', 'stats'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && [
                                    styles.activeTab,
                                    { borderBottomColor: colors.tint },
                                ],
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    activeTab === tab && {
                                        color: colors.tint,
                                        fontWeight: '600',
                                    },
                                ]}
                            >
                                {tab === 'analysis'
                                    ? 'Nova Análise'
                                    : tab === 'history'
                                      ? 'Histórico'
                                      : 'Estatísticas'}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                {activeTab === 'analysis' && (
                    <View style={styles.content}>
                        {/* Upload Section */}
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <ThemedText
                                    type="subtitle"
                                    style={styles.cardTitle}
                                >
                                    Capturar Imagem
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.cardDescription,
                                        { color: colors.text },
                                    ]}
                                >
                                    Selecione uma imagem clara da planta
                                </ThemedText>
                            </View>

                            <View style={styles.imagePreview}>
                                {file ? (
                                    <Image
                                        source={{ uri: file.uri }}
                                        style={{
                                            width: '100%',
                                            height: imageHeight,
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.placeholderImage,
                                            {
                                                backgroundColor:
                                                    colors.tint + '20',
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={{
                                                color: colors.text,
                                                textAlign: 'center',
                                            }}
                                        >
                                            📷
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                color: colors.text,
                                                fontSize: 12,
                                            }}
                                        >
                                            Selecione uma imagem
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {file && (
                                <ThemedText
                                    style={[
                                        styles.fileName,
                                        { color: colors.text },
                                    ]}
                                >
                                    {file.fileName || 'image.jpg'}
                                </ThemedText>
                            )}

                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { backgroundColor: colors.tint },
                                    ]}
                                    onPress={pickImage}
                                >
                                    <ThemedText style={styles.buttonText}>
                                        Galeria
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { backgroundColor: colors.tint },
                                    ]}
                                    onPress={takePhoto}
                                >
                                    <ThemedText style={styles.buttonText}>
                                        Câmera
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.analyzeButton,
                                    {
                                        backgroundColor: colors.tint,
                                        opacity: !file || loading ? 0.5 : 1,
                                    },
                                ]}
                                onPress={handleAnalyzeClick}
                                disabled={!file || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>
                                        Analisar Imagem
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        </ThemedView>

                        {/* Results Section */}
                        {!result && !loading && !file && (
                            <ThemedView
                                type="backgroundElement"
                                style={[
                                    styles.card,
                                    { borderColor: colors.backgroundElement },
                                ]}
                            >
                                <View style={styles.emptyState}>
                                    <Text
                                        style={{
                                            fontSize: 40,
                                            marginBottom: 16,
                                        }}
                                    >
                                        🌿
                                    </Text>
                                    <ThemedText style={{ textAlign: 'center' }}>
                                        Selecione uma imagem para obter um
                                        diagnóstico
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        )}

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
                                    <ThemedText style={{ marginTop: 12 }}>
                                        Analisando a imagem...
                                    </ThemedText>
                                    <ThemedText
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: colors.text,
                                        }}
                                    >
                                        Isso pode levar alguns segundos
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        )}

                        {result && (
                            <ThemedView
                                type="backgroundElement"
                                style={[
                                    styles.card,
                                    { borderColor: colors.backgroundElement },
                                ]}
                            >
                                <View style={styles.resultSection}>
                                    <View>
                                        <ThemedText style={styles.resultLabel}>
                                            Diagnóstico
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.resultValue,
                                                {
                                                    color: colors.tint,
                                                    marginTop: 4,
                                                },
                                            ]}
                                        >
                                            {result.sickness.name}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.divider} />

                                    <View>
                                        <ThemedText style={styles.resultLabel}>
                                            Recomendações de Manejo
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                marginTop: 8,
                                                color: colors.text,
                                            }}
                                        >
                                            {result.handling}
                                        </ThemedText>
                                    </View>

                                    <View
                                        style={[
                                            styles.alertBox,
                                            {
                                                backgroundColor:
                                                    colors.tint + '15',
                                                borderColor: colors.tint,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.alertTitle,
                                                {
                                                    color: colors.tint,
                                                    fontWeight: '600',
                                                },
                                            ]}
                                        >
                                            ⚠️ Importante
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                color: colors.text,
                                                fontSize: 12,
                                            }}
                                        >
                                            Consulte um agrônomo para confirmar
                                            o diagnóstico e obter recomendações
                                            específicas para sua lavoura.
                                        </ThemedText>
                                    </View>
                                </View>
                            </ThemedView>
                        )}

                        {/* Tips Section */}
                        <View style={styles.tipsSection}>
                            <ThemedText
                                type="subtitle"
                                style={styles.tipsTitle}
                            >
                                Dicas para Melhores Resultados
                            </ThemedText>

                            <View style={styles.tipGrid}>
                                <ThemedView
                                    type="backgroundElement"
                                    style={[
                                        styles.tipCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.tipCardTitle}>
                                        Qualidade da Imagem
                                    </ThemedText>
                                    <ThemedText style={styles.tipCardText}>
                                        Utilize imagens nítidas e bem
                                        iluminadas. Evite sombras.
                                    </ThemedText>
                                </ThemedView>

                                <ThemedView
                                    type="backgroundElement"
                                    style={[
                                        styles.tipCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.tipCardTitle}>
                                        Foco nos Sintomas
                                    </ThemedText>
                                    <ThemedText style={styles.tipCardText}>
                                        Capture os sintomas visíveis como
                                        manchas ou descolorações.
                                    </ThemedText>
                                </ThemedView>

                                <ThemedView
                                    type="backgroundElement"
                                    style={[
                                        styles.tipCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.tipCardTitle}>
                                        Múltiplas Amostras
                                    </ThemedText>
                                    <ThemedText style={styles.tipCardText}>
                                        Analise várias imagens em diferentes
                                        ângulos para precisão.
                                    </ThemedText>
                                </ThemedView>
                            </View>
                        </View>
                    </View>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <View style={styles.content}>
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <ThemedText
                                    type="subtitle"
                                    style={styles.cardTitle}
                                >
                                    Histórico de Análises
                                </ThemedText>
                            </View>

                            <View style={styles.historyList}>
                                {ANALYSIS_HISTORY.map((analysis, index) => (
                                    <View
                                        key={analysis.id}
                                        style={[
                                            styles.historyItem,
                                            {
                                                borderBottomColor:
                                                    colors.backgroundElement,
                                                borderBottomWidth:
                                                    index <
                                                    ANALYSIS_HISTORY.length - 1
                                                        ? 1
                                                        : 0,
                                            },
                                        ]}
                                    >
                                        <View>
                                            <ThemedText
                                                style={styles.historyPrediction}
                                            >
                                                {analysis.prediction}
                                            </ThemedText>
                                            <ThemedText
                                                style={{
                                                    fontSize: 12,
                                                    color: colors.text,
                                                    marginTop: 4,
                                                }}
                                            >
                                                Cultura: {analysis.crop}
                                            </ThemedText>
                                            <ThemedText
                                                style={{
                                                    fontSize: 11,
                                                    color: colors.text,
                                                    marginTop: 2,
                                                }}
                                            >
                                                {analysis.date}
                                            </ThemedText>
                                        </View>
                                        <ThemedView
                                            type="backgroundElement"
                                            style={styles.confidenceBadge}
                                        >
                                            <ThemedText
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: '600',
                                                    color: colors.tint,
                                                }}
                                            >
                                                {analysis.confidence.toFixed(1)}
                                                %
                                            </ThemedText>
                                        </ThemedView>
                                    </View>
                                ))}
                            </View>
                        </ThemedView>
                    </View>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <View style={styles.content}>
                        <ThemedView
                            type="backgroundElement"
                            style={[
                                styles.card,
                                { borderColor: colors.backgroundElement },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <ThemedText
                                    type="subtitle"
                                    style={styles.cardTitle}
                                >
                                    Estatísticas de Análises
                                </ThemedText>
                            </View>

                            <View style={styles.statsGrid}>
                                <ThemedView
                                    type="background"
                                    style={[
                                        styles.statCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.statLabel}>
                                        Total de Análises
                                    </ThemedText>
                                    <ThemedText style={styles.statValue}>
                                        24
                                    </ThemedText>
                                    <ThemedText style={styles.statChange}>
                                        +8 este mês
                                    </ThemedText>
                                </ThemedView>

                                <ThemedView
                                    type="background"
                                    style={[
                                        styles.statCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.statLabel}>
                                        Culturas Analisadas
                                    </ThemedText>
                                    <ThemedText style={styles.statValue}>
                                        5
                                    </ThemedText>
                                    <ThemedText style={styles.statChange}>
                                        Soja, Milho, Café...
                                    </ThemedText>
                                </ThemedView>

                                <ThemedView
                                    type="background"
                                    style={[
                                        styles.statCard,
                                        {
                                            borderColor:
                                                colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText style={styles.statLabel}>
                                        Confiança Média
                                    </ThemedText>
                                    <ThemedText style={styles.statValue}>
                                        89.4%
                                    </ThemedText>
                                    <ThemedText style={styles.statChange}>
                                        +2.1% desde o último mês
                                    </ThemedText>
                                </ThemedView>
                            </View>

                            <ThemedText
                                type="subtitle"
                                style={styles.diseasesTitle}
                            >
                                Doenças Mais Frequentes
                            </ThemedText>

                            <View style={styles.diseasesList}>
                                {[
                                    {
                                        name: 'Ferrugem Asiática',
                                        percentage: 38,
                                    },
                                    {
                                        name: 'Mancha de Cercospora',
                                        percentage: 24,
                                    },
                                    {
                                        name: 'Ferrugem do Cafeeiro',
                                        percentage: 18,
                                    },
                                    { name: 'Antracnose', percentage: 12 },
                                    { name: 'Outras', percentage: 8 },
                                ].map((disease) => (
                                    <View
                                        key={disease.name}
                                        style={styles.diseaseItem}
                                    >
                                        <View style={styles.diseaseHeader}>
                                            <ThemedText
                                                style={styles.diseaseName}
                                            >
                                                {disease.name}
                                            </ThemedText>
                                            <ThemedText
                                                style={{
                                                    fontSize: 12,
                                                    color: colors.text,
                                                }}
                                            >
                                                {disease.percentage}%
                                            </ThemedText>
                                        </View>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                {
                                                    backgroundColor:
                                                        colors.backgroundElement,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${disease.percentage}%`,
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        marginVertical: 16,
    },
    title: {
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginVertical: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 14,
    },
    content: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        marginBottom: 16,
    },
    cardTitle: {
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
    },
    imagePreview: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        height: 250,
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        fontSize: 12,
        marginBottom: 12,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    analyzeButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    resultSection: {
        gap: 16,
    },
    resultLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
    },
    alertBox: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
    },
    alertTitle: {
        marginBottom: 4,
    },
    tipsSection: {
        marginBottom: 16,
    },
    tipsTitle: {
        marginBottom: 12,
    },
    tipGrid: {
        gap: 12,
    },
    tipCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
    },
    tipCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    tipCardText: {
        fontSize: 12,
    },
    historyList: {
        gap: 0,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    historyPrediction: {
        fontWeight: '600',
        fontSize: 14,
    },
    confidenceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statsGrid: {
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
    },
    statLabel: {
        fontSize: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 4,
    },
    statChange: {
        fontSize: 11,
        marginTop: 4,
    },
    diseasesTitle: {
        marginBottom: 12,
    },
    diseasesList: {
        gap: 12,
    },
    diseaseItem: {
        gap: 6,
    },
    diseaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diseaseName: {
        fontSize: 13,
        fontWeight: '500',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
});
