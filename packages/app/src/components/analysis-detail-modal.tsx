import React from 'react';
import {
    Modal,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { imageToDataUri } from '@/lib/utils';
import type { History } from '@/models/History';

interface AnalysisDetailModalProps {
    visible: boolean;
    analysis: History | null;
    onClose: () => void;
}

export function AnalysisDetailModal({ visible, analysis, onClose }: AnalysisDetailModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[isDark ? 'dark' : 'light'];
    const styles = makeStyles(colors, isDark);

    if (!analysis) return null;

    const imageSrc = imageToDataUri(analysis.image);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                        <View style={styles.header}>
                            <View style={styles.headerHandle} />
                            <View style={styles.headerContent}>
                                <ThemedText style={styles.headerTitle}>Detalhes da Análise</ThemedText>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <ThemedText style={[styles.closeBtnText, { color: colors.textSecondary }]}>
                                        ✕
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                            <ThemedText style={[styles.headerSub, { color: colors.textSecondary }]}>
                                {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </ThemedText>
                        </View>

                        <ScrollView
                            style={styles.body}
                            contentContainerStyle={styles.bodyContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {imageSrc && (
                                <Image source={{ uri: imageSrc }} style={styles.image} resizeMode="cover" />
                            )}

                            <View style={styles.section}>
                                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                                    Diagnóstico
                                </ThemedText>
                                <ThemedText style={styles.value}>
                                    {analysis.explanation || 'Não identificado'}
                                </ThemedText>
                                {analysis.sicknessConfidence != null && (
                                    <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                        <ThemedText style={styles.badgeText}>
                                            Confiança: {(analysis.sicknessConfidence * 100).toFixed(1)}%
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            <View style={styles.section}>
                                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                                    Cultura
                                </ThemedText>
                                <ThemedText style={styles.value}>
                                    {analysis.crop || 'Não identificada'}
                                    {analysis.cropConfidence != null &&
                                        ` (Confiança: ${(analysis.cropConfidence * 100).toFixed(1)}%)`}
                                </ThemedText>
                            </View>

                            {analysis.causes && (
                                <View style={[styles.section, styles.sectionBordered, { borderTopColor: isDark ? colors.backgroundSelected : '#e8e8eb' }]}>
                                    <ThemedText style={styles.sectionTitle}>Causas / Sintomas</ThemedText>
                                    <ThemedText style={[styles.value, { color: colors.textSecondary }]}>
                                        {analysis.causes}
                                    </ThemedText>
                                </View>
                            )}

                            {analysis.handling && (
                                <View style={[styles.section, styles.sectionBordered, { borderTopColor: isDark ? colors.backgroundSelected : '#e8e8eb' }]}>
                                    <ThemedText style={styles.sectionTitle}>Recomendações de Manejo</ThemedText>
                                    <ThemedText style={[styles.value, { color: colors.textSecondary }]}>
                                        {analysis.handling}
                                    </ThemedText>
                                </View>
                            )}

                            {analysis.precautions && (
                                <View style={[styles.section, styles.sectionBordered, { borderTopColor: isDark ? colors.backgroundSelected : '#e8e8eb' }]}>
                                    <ThemedText style={styles.sectionTitle}>Precauções</ThemedText>
                                    <ThemedText style={[styles.value, { color: colors.textSecondary }]}>
                                        {analysis.precautions}
                                    </ThemedText>
                                </View>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

function makeStyles(colors: (typeof Colors)['light'], isDark: boolean) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.45)',
        },
        sheet: {
            height: '85%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: isDark ? colors.background : '#ffffff',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 20,
        },
        safeArea: {
            flex: 1,
        },
        header: {
            paddingTop: Spacing.two,
            paddingBottom: Spacing.two,
            paddingHorizontal: Spacing.three,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? colors.backgroundSelected : '#e8e8eb',
        },
        headerHandle: {
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: isDark ? colors.backgroundSelected : '#d0d0d3',
            alignSelf: 'center',
            marginBottom: Spacing.two,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: 17,
            fontWeight: '600',
        },
        headerSub: {
            fontSize: 12,
            marginTop: 4,
        },
        closeBtn: {
            padding: Spacing.two,
        },
        closeBtnText: {
            fontSize: 16,
            fontWeight: '500',
        },
        body: {
            flex: 1,
        },
        bodyContent: {
            padding: Spacing.three,
            paddingBottom: Spacing.four,
        },
        image: {
            width: '100%',
            height: 200,
            borderRadius: 12,
            marginBottom: Spacing.three,
        },
        section: {
            marginBottom: Spacing.three,
        },
        sectionBordered: {
            borderTopWidth: 1,
            paddingTop: Spacing.three,
        },
        label: {
            fontSize: 12,
            marginBottom: 2,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        value: {
            fontSize: 15,
            lineHeight: 21,
        },
        badge: {
            alignSelf: 'flex-start',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginTop: 6,
        },
        badgeText: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
        },
    });
}
