import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { subscribeAlert, getCurrentAlert, dismissAlert, type AlertRequest } from '@/lib/alert-store';

export function AlertHost() {
    const [request, setRequest] = useState<AlertRequest | null>(getCurrentAlert());
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    useEffect(() => subscribeAlert(setRequest), []);

    if (!request) return null;

    return (
        <Modal transparent animationType="fade" visible onRequestClose={dismissAlert}>
            <View style={styles.overlay}>
                <View style={[styles.box, { backgroundColor: colors.background, borderColor: colors.backgroundElement }]}>
                    <ThemedText style={styles.title}>{request.title}</ThemedText>
                    {!!request.message && (
                        <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
                            {request.message}
                        </ThemedText>
                    )}
                    <View style={styles.buttonsRow}>
                        {request.buttons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.button}
                                onPress={() => {
                                    dismissAlert();
                                    btn.onPress?.();
                                }}
                            >
                                <ThemedText
                                    style={[
                                        styles.buttonText,
                                        { color: btn.style === 'destructive' ? '#ef4444' : colors.tint },
                                        btn.style === 'cancel' && { color: colors.textSecondary, fontWeight: '500' },
                                    ]}
                                >
                                    {btn.text}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    box: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 14,
        borderWidth: 1,
        padding: 20,
    },
    title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    message: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    button: { paddingVertical: 6, paddingHorizontal: 4 },
    buttonText: { fontSize: 14, fontWeight: '700' },
});
