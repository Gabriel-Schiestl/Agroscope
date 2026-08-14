import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import PasswordRecoveryAPI from '../../api/auth/PasswordRecovery';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Preencha o email.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        const result = await PasswordRecoveryAPI(email);
        setIsSubmitting(false);

        if (result.success) {
            router.push({
                pathname: '/reset-password',
                params: { email },
            });
        } else {
            setError('Não foi possível enviar o código. Tente novamente.');
        }
    };

    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            <SafeAreaView style={{ backgroundColor: colors.background }}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ThemedText style={[styles.backBtn, { color: colors.tint }]}>
                            ← Voltar
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: isDark
                                    ? colors.backgroundElement
                                    : '#fff',
                                borderColor: colors.backgroundElement,
                            },
                        ]}
                    >
                        <ThemedText
                            style={[styles.brand, { color: colors.tint }]}
                        >
                            AgroScope
                        </ThemedText>
                        <ThemedText style={styles.cardTitle}>
                            Esqueceu a senha?
                        </ThemedText>
                        <ThemedText
                            style={[
                                styles.cardSubtitle,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Informe seu email para receber um código de
                            recuperação
                        </ThemedText>

                        {!!error && (
                            <View
                                style={[
                                    styles.errorBox,
                                    { borderColor: '#f87171' },
                                ]}
                            >
                                <ThemedText style={styles.errorText}>
                                    {error}
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Email</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark
                                            ? colors.backgroundSelected
                                            : '#f8f8f8',
                                        borderColor: colors.backgroundElement,
                                        color: colors.text,
                                    },
                                ]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="seu@email.com"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.tint },
                                isSubmitting && { opacity: 0.7 },
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.submitBtnText}>
                                    Enviar código
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerLink}>
                            <ThemedText
                                style={[
                                    styles.footerLinkText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Lembrou a senha?{' '}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => router.replace('/login')}
                            >
                                <ThemedText
                                    style={[
                                        styles.footerLinkAction,
                                        { color: colors.tint },
                                    ]}
                                >
                                    Entrar
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backBtn: {
        fontSize: 14,
        fontWeight: '500',
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    brand: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 20,
    },
    errorBox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: 'rgba(248,113,113,0.08)',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    submitBtn: {
        borderRadius: 8,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    footerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLinkText: {
        fontSize: 13,
    },
    footerLinkAction: {
        fontSize: 13,
        fontWeight: '600',
    },
});
