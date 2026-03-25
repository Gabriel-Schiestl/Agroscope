import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const router = useRouter();

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
                        Bem-vindo ao Agroscope
                    </ThemedText>
                    <ThemedText
                        style={[styles.subtitle, { color: colors.text }]}
                    >
                        Diagnóstico inteligente de plantas
                    </ThemedText>
                </View>

                {/* Welcome Card */}
                <ThemedView
                    type="backgroundElement"
                    style={[
                        styles.card,
                        { borderColor: colors.backgroundElement },
                    ]}
                >
                    <ThemedText
                        type="subtitle"
                        style={[styles.cardTitle, { marginBottom: 12 }]}
                    >
                        🌾 Sistema de Análise de Plantas
                    </ThemedText>
                    <ThemedText
                        style={[styles.cardText, { color: colors.text }]}
                    >
                        Utilize a câmera ou galeria do seu dispositivo para
                        capturar imagens de plantas e receba diagnósticos
                        automáticos de doenças com recomendações de manejo.
                    </ThemedText>
                </ThemedView>

                {/* Features */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Recursos
                </ThemedText>

                <ThemedView
                    type="backgroundElement"
                    style={[
                        styles.featureCard,
                        { borderColor: colors.backgroundElement },
                    ]}
                >
                    <ThemedText style={styles.featureEmoji}>📷</ThemedText>
                    <ThemedText style={styles.featureTitle}>
                        Captura de Imagens
                    </ThemedText>
                    <ThemedText
                        style={[styles.featureText, { color: colors.text }]}
                    >
                        Tire fotos pela câmera ou selecione da galeria
                    </ThemedText>
                </ThemedView>

                <ThemedView
                    type="backgroundElement"
                    style={[
                        styles.featureCard,
                        { borderColor: colors.backgroundElement },
                    ]}
                >
                    <ThemedText style={styles.featureEmoji}>🔍</ThemedText>
                    <ThemedText style={styles.featureTitle}>
                        Análise Automática
                    </ThemedText>
                    <ThemedText
                        style={[styles.featureText, { color: colors.text }]}
                    >
                        IA identifica doenças com alta precisão
                    </ThemedText>
                </ThemedView>

                <ThemedView
                    type="backgroundElement"
                    style={[
                        styles.featureCard,
                        { borderColor: colors.backgroundElement },
                    ]}
                >
                    <ThemedText style={styles.featureEmoji}>📊</ThemedText>
                    <ThemedText style={styles.featureTitle}>
                        Histórico e Estatísticas
                    </ThemedText>
                    <ThemedText
                        style={[styles.featureText, { color: colors.text }]}
                    >
                        Acompanhe análises passadas e tendências
                    </ThemedText>
                </ThemedView>

                {/* CTA Button */}
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: colors.tint }]}
                    onPress={() => router.push('/analytics')}
                >
                    <ThemedText style={styles.ctaButtonText}>
                        Iniciar Análise
                    </ThemedText>
                </TouchableOpacity>

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
        marginVertical: 20,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardText: {
        fontSize: 13,
        lineHeight: 20,
    },
    sectionTitle: {
        marginBottom: 12,
        marginTop: 8,
    },
    featureCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    featureEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureText: {
        fontSize: 12,
        textAlign: 'center',
    },
    ctaButton: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginVertical: 24,
    },
    ctaButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
