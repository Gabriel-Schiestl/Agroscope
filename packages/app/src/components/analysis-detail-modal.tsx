import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    useColorScheme,
    Animated,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, type ThemePalette } from '@/constants/theme';
import { imageToDataUri } from '@/lib/utils';
import { cropLabel, sicknessLabel } from '@/lib/agro-labels';
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

    const translateY = useRef(new Animated.Value(0)).current;
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (visible) {
            translateY.setValue(0);
        }
    }, [visible, translateY]);

    // Arrasta o cabeçalho (alça) para baixo para fechar, como em bottom
    // sheets nativas.
    const [panResponder] = useState(() =>
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                gesture.dy > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy);
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 100 || gesture.vy > 0.8) {
                    onCloseRef.current();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 65,
                        friction: 11,
                    }).start();
                }
            },
        }),
    );

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

                <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                        <View style={styles.header} {...panResponder.panHandlers}>
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
                                    Cultura Identificada
                                </ThemedText>
                                <ThemedText style={[styles.value, { color: colors.tint }]}>
                                    {cropLabel(analysis.crop)}
                                    {analysis.cropConfidence != null &&
                                        ` · ${(analysis.cropConfidence * 100).toFixed(1)}% confiança`}
                                </ThemedText>
                            </View>

                            <View style={styles.section}>
                                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                                    Diagnóstico
                                </ThemedText>
                                {!analysis.sicknessId ? (
                                    <View style={[styles.badge, { backgroundColor: colors.tint, alignSelf: 'flex-start' }]}>
                                        <ThemedText style={styles.badgeText}>🌿 Planta Saudável</ThemedText>
                                    </View>
                                ) : (
                                    <>
                                        <ThemedText style={[styles.value, { fontWeight: '600' }]}>
                                            {analysis.sicknessName
                                                ? sicknessLabel(analysis.sicknessName)
                                                : analysis.explanation || 'Doença identificada'}
                                        </ThemedText>
                                        {analysis.sicknessConfidence != null && (
                                            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                                <ThemedText style={styles.badgeText}>
                                                    Confiança: {(analysis.sicknessConfidence * 100).toFixed(1)}%
                                                </ThemedText>
                                            </View>
                                        )}
                                        {analysis.explanation && (
                                            <ThemedText style={[styles.value, { color: colors.textSecondary, marginTop: 6 }]}>
                                                {analysis.explanation}
                                            </ThemedText>
                                        )}
                                    </>
                                )}
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
                </Animated.View>
            </View>
        </Modal>
    );
}

function makeStyles(colors: ThemePalette, isDark: boolean) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFill,
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
