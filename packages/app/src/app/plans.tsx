import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useToast } from 'expo-toast';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { usePlans } from '@/hooks/use-plans';
import api from '@/shared/http/http.config';
import type { Plan } from '@/models/Plan';

function formatPrice(price: number): string {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
}

export default function PlansScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const isDark = colorScheme === 'dark';
    const toast = useToast();
    const { auth, refreshAuth } = useAuth();
    const { plans, isLoading } = usePlans();
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    const confirmHire = async (plan: Plan) => {
        setSubmittingId(plan.id);
        try {
            await api.patch('/user/plan', { planId: plan.id });
            toast.show(`Plano ${plan.type} contratado com sucesso!`);
            await refreshAuth();
        } catch {
            toast.show('Não foi possível contratar o plano. Tente novamente.');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleHire = (plan: Plan) => {
        Alert.alert(
            'Confirmar contratação',
            `Deseja contratar o plano ${plan.type} por ${formatPrice(plan.price)}${
                plan.price > 0 ? '/mês' : ''
            }? Futuramente você poderá escolher a forma de cobrança.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => confirmHire(plan) },
            ],
        );
    };

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
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ThemedText style={[styles.backBtn, { color: colors.tint }]}>
                            ← Voltar
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.pageTitle}>
                    <ThemedText style={styles.title}>Planos</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Escolha o plano ideal para o seu negócio
                    </ThemedText>
                </View>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 32 }} color={colors.tint} />
                ) : (
                    <View style={styles.plansList}>
                        {plans.map((plan) => {
                            const isCurrentPlan = plan.id === auth?.planId;
                            return (
                                <ThemedView
                                    key={plan.id}
                                    type="backgroundElement"
                                    style={[
                                        styles.card,
                                        {
                                            borderColor: isCurrentPlan
                                                ? colors.tint
                                                : colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <View style={styles.planHeader}>
                                        <ThemedText style={styles.cardTitle}>{plan.type}</ThemedText>
                                        {isCurrentPlan && (
                                            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                                <ThemedText style={styles.badgeText}>Em uso</ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.priceRow}>
                                        <ThemedText style={styles.price}>
                                            {formatPrice(plan.price)}
                                        </ThemedText>
                                        {plan.price > 0 && (
                                            <ThemedText
                                                style={[styles.pricePeriod, { color: colors.textSecondary }]}
                                            >
                                                /mês
                                            </ThemedText>
                                        )}
                                    </View>

                                    <View style={styles.featuresList}>
                                        <View style={styles.featureRow}>
                                            <ThemedText style={[styles.featureCheck, { color: colors.tint }]}>
                                                ✓
                                            </ThemedText>
                                            <ThemedText
                                                style={[styles.featureText, { color: colors.textSecondary }]}
                                            >
                                                Até {plan.imageLimit} diagnósticos de imagem por mês
                                            </ThemedText>
                                        </View>
                                        <View style={styles.featureRow}>
                                            <ThemedText style={[styles.featureCheck, { color: colors.tint }]}>
                                                ✓
                                            </ThemedText>
                                            <ThemedText
                                                style={[styles.featureText, { color: colors.textSecondary }]}
                                            >
                                                Até {plan.chatLimit} interações no chat por mês
                                            </ThemedText>
                                        </View>
                                        {plan.features.map((feature, index) => (
                                            <View key={index} style={styles.featureRow}>
                                                <ThemedText
                                                    style={[styles.featureCheck, { color: colors.tint }]}
                                                >
                                                    ✓
                                                </ThemedText>
                                                <ThemedText
                                                    style={[styles.featureText, { color: colors.textSecondary }]}
                                                >
                                                    {feature}
                                                </ThemedText>
                                            </View>
                                        ))}
                                    </View>

                                    {isCurrentPlan ? (
                                        <View
                                            style={[
                                                styles.hireBtn,
                                                styles.hireBtnDisabled,
                                                { borderColor: colors.backgroundElement },
                                            ]}
                                        >
                                            <ThemedText
                                                style={[styles.hireBtnText, { color: colors.textSecondary }]}
                                            >
                                                Em uso
                                            </ThemedText>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[
                                                styles.hireBtn,
                                                { backgroundColor: colors.tint },
                                                submittingId === plan.id && { opacity: 0.7 },
                                            ]}
                                            onPress={() => handleHire(plan)}
                                            disabled={submittingId === plan.id}
                                        >
                                            {submittingId === plan.id ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <ThemedText style={[styles.hireBtnText, { color: '#fff' }]}>
                                                    Contratar
                                                </ThemedText>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </ThemedView>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    topBar: { paddingHorizontal: 20, paddingVertical: 12 },
    backBtn: { fontSize: 14, fontWeight: '500' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    pageTitle: { marginTop: 8, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 13 },
    plansList: { gap: 16 },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
    },
    cardTitle: { fontSize: 17, fontWeight: '700' },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 14 },
    price: { fontSize: 24, fontWeight: '700' },
    pricePeriod: { fontSize: 13, marginBottom: 3 },
    featuresList: { gap: 8, marginBottom: 16 },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    featureCheck: { fontSize: 13, fontWeight: '700', marginTop: 1 },
    featureText: { flex: 1, fontSize: 13, lineHeight: 18 },
    hireBtn: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    hireBtnDisabled: { borderWidth: 1 },
    hireBtnText: { fontWeight: '600', fontSize: 14 },
});
