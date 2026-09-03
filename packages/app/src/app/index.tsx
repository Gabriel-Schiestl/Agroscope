import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';

const C = {
    bg: '#19241b',
    bgCard: '#0d1a0f',
    bgCardHover: '#09200b',
    text: '#f4fff4',
    textMuted: '#a2a8a2',
    textSecondary: '#cae8cb',
    primary: '#4dae50',
    primaryDark: '#334f36',
    border: 'rgba(77, 174, 80, 0.2)',
};

const FEATURES = [
    {
        icon: '🌿',
        title: 'Diagnóstico Preciso',
        desc: 'Nossa IA foi treinada com milhares de imagens para identificar com precisão mais de 50 doenças em plantas.',
    },
    {
        icon: '✅',
        title: 'Recomendações Personalizadas',
        desc: 'Receba orientações específicas para tratamento e prevenção baseadas no diagnóstico da sua planta.',
    },
    {
        icon: '📊',
        title: 'Histórico Completo',
        desc: 'Acompanhe todas as suas análises anteriores e visualize tendências ao longo do tempo.',
    },
];

const STEPS = [
    {
        step: '01',
        icon: '📷',
        title: 'Envie a Imagem',
        desc: 'Faça upload de uma foto da folha da sua planta usando a câmera ou galeria.',
    },
    {
        step: '02',
        icon: '⚡',
        title: 'Análise com IA',
        desc: 'Nosso algoritmo processa e identifica possíveis doenças em segundos.',
    },
    {
        step: '03',
        icon: '🎯',
        title: 'Receba Resultados',
        desc: 'Obtenha diagnóstico detalhado com recomendações de tratamento.',
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/analytics');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || isAuthenticated) {
        return null;
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.brand}>AgroScope</ThemedText>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => router.push('/login')}
                    >
                        <ThemedText style={styles.loginBtnText}>
                            Entrar
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <ThemedText style={styles.heroTitle}>
                        Diagnóstico de Plantas com{' '}
                        <ThemedText style={[styles.heroTitle, styles.heroTitleAccent]}>
                            Inteligência Artificial
                        </ThemedText>
                    </ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                        Identifique doenças em suas plantas instantaneamente com
                        nossa tecnologia avançada de IA. Obtenha recomendações
                        precisas para tratamento e prevenção.
                    </ThemedText>

                    <View style={styles.heroActions}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.push('/signup')}
                        >
                            <ThemedText style={styles.primaryBtnText}>
                                Criar Conta Grátis
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.outlineBtn}
                            onPress={() => router.push('/login')}
                        >
                            <ThemedText style={styles.outlineBtnText}>
                                Já tenho conta
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Por que escolher */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                        Por que escolher o{' '}
                        <ThemedText style={[styles.sectionTitle, { color: C.primary }]}>
                            AgroScope?
                        </ThemedText>
                    </ThemedText>

                    <View style={styles.featuresGrid}>
                        {FEATURES.map((f) => (
                            <View key={f.title} style={styles.featureCard}>
                                <View style={styles.featureIconWrap}>
                                    <ThemedText style={styles.featureIcon}>
                                        {f.icon}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.featureTitle}>
                                    {f.title}
                                </ThemedText>
                                <ThemedText style={styles.featureDesc}>
                                    {f.desc}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Como Funciona */}
                <View style={[styles.section, styles.howSection]}>
                    <ThemedText style={styles.sectionTitle}>
                        Como funciona
                    </ThemedText>

                    <View style={styles.stepsGrid}>
                        {STEPS.map((s, idx) => (
                            <View key={s.step} style={styles.stepCard}>
                                <View style={styles.stepIconWrap}>
                                    <ThemedText style={styles.stepIcon}>
                                        {s.icon}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.stepNumber}>
                                    PASSO {s.step}
                                </ThemedText>
                                <ThemedText style={styles.stepTitle}>
                                    {s.title}
                                </ThemedText>
                                <ThemedText style={styles.stepDesc}>
                                    {s.desc}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom CTA */}
                <View style={styles.ctaSection}>
                    <ThemedText style={styles.ctaTitle}>
                        Comece agora gratuitamente
                    </ThemedText>
                    <ThemedText style={styles.ctaSubtitle}>
                        Junte-se a milhares de produtores que já utilizam o
                        AgroScope para proteger suas lavouras.
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => router.push('/signup')}
                    >
                        <ThemedText style={styles.primaryBtnText}>
                            Criar Conta Gratis →
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        © 2024 AgroScope. Todos os direitos reservados.
                    </ThemedText>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bg,
    },
    safeArea: {
        backgroundColor: C.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    brand: {
        fontSize: 20,
        fontWeight: '700',
        color: C.primary,
    },
    loginBtn: {
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    loginBtnText: {
        color: C.text,
        fontSize: 14,
        fontWeight: '500',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 0,
    },
    /* Hero */
    hero: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 48,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 16,
    },
    heroTitleAccent: {
        color: C.primary,
    },
    heroSubtitle: {
        fontSize: 15,
        color: C.text,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        opacity: 0.85,
    },
    heroActions: {
        width: '100%',
        gap: 10,
    },
    primaryBtn: {
        backgroundColor: C.primary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    outlineBtnText: {
        color: C.text,
        fontWeight: '500',
        fontSize: 15,
    },
    /* Sections */
    section: {
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    /* Features */
    featuresGrid: {
        gap: 14,
    },
    featureCard: {
        backgroundColor: C.bgCard,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 20,
    },
    featureIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(77,174,80,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        fontSize: 20,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: C.text,
        marginBottom: 6,
    },
    featureDesc: {
        fontSize: 13,
        color: C.textMuted,
        lineHeight: 19,
    },
    /* How it works */
    howSection: {
        backgroundColor: C.bgCard,
    },
    stepsGrid: {
        gap: 20,
    },
    stepCard: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    stepIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(77,174,80,0.1)',
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    stepIcon: {
        fontSize: 22,
    },
    stepNumber: {
        fontSize: 11,
        fontWeight: '700',
        color: C.textSecondary,
        letterSpacing: 2,
        marginBottom: 4,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: C.text,
        marginBottom: 6,
    },
    stepDesc: {
        fontSize: 13,
        color: C.textMuted,
        textAlign: 'center',
        lineHeight: 19,
    },
    /* Bottom CTA */
    ctaSection: {
        marginHorizontal: 20,
        marginVertical: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: 'rgba(77,174,80,0.06)',
        padding: 28,
        alignItems: 'center',
        gap: 12,
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: 13,
        color: C.textMuted,
        textAlign: 'center',
        lineHeight: 19,
    },
    /* Footer */
    footer: {
        backgroundColor: C.bgCard,
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: C.textMuted,
    },
});
