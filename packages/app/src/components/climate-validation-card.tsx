import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { CloudSun, TriangleAlert } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { climateValidationMessage, climateValidationTitle } from '@/lib/climate';
import type { ClimateValidation } from '@/models/History';

const WARNING_COLOR = '#d97706';

interface ClimateValidationCardProps {
    validation?: ClimateValidation;
}

/**
 * Mostra se a doença diagnosticada pela IA é plausível para o clima recente
 * da região do usuário. Sem validação (localização negada ou clima
 * indisponível), informa que o diagnóstico não foi cruzado com o clima.
 */
export function ClimateValidationCard({ validation }: ClimateValidationCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    if (!validation) {
        return (
            <View style={[styles.box, { borderColor: colors.backgroundSelected }]}>
                <View style={styles.row}>
                    <CloudSun size={15} color={colors.textSecondary} />
                    <ThemedText style={[styles.title, { color: colors.textSecondary }]}>
                        Clima da região não verificado
                    </ThemedText>
                </View>
                <ThemedText style={[styles.body, { color: colors.textSecondary }]}>
                    Permita o acesso à localização para validarmos se esta doença é
                    compatível com o clima da sua região.
                </ThemedText>
            </View>
        );
    }

    const accent = validation.compatible ? colors.tint : WARNING_COLOR;
    const Icon = validation.compatible ? CloudSun : TriangleAlert;

    return (
        <View
            style={[styles.box, { backgroundColor: accent + '15', borderColor: accent + '40' }]}
            accessibilityRole="summary"
        >
            <View style={styles.row}>
                <Icon size={15} color={accent} />
                <ThemedText style={[styles.title, { color: accent }]}>
                    {climateValidationTitle(validation)}
                </ThemedText>
            </View>
            <ThemedText style={[styles.body, { color: colors.textSecondary }]}>
                {climateValidationMessage(validation)}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        gap: 4,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
    body: { fontSize: 12, lineHeight: 18 },
});
