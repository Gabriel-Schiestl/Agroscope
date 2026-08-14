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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import ChangePasswordAPI from '../../api/auth/ChangePassword';

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE =
    'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
    const email = typeof emailParam === 'string' ? emailParam : '';
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!token || !newPassword || !confirmPassword) {
            setError('Preencha todos os campos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            setError(PASSWORD_MESSAGE);
            return;
        }
        setError('');
        setIsSubmitting(true);
        const result = await ChangePasswordAPI(email, token, newPassword);
        setIsSubmitting(false);

        if (result.success) {
            router.replace('/login');
        } else {
            setError(
                result.message ||
                    'Código inválido ou expirado. Tente novamente.',
            );
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
                            Redefinir senha
                        </ThemedText>
                        <ThemedText
                            style={[
                                styles.cardSubtitle,
                                { color: colors.textSecondary },
                            ]}
                        >
                            {email
                                ? `Digite o código enviado para ${email} e escolha uma nova senha`
                                : 'Digite o código recebido por email e escolha uma nova senha'}
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
                            <ThemedText style={styles.label}>
                                Código de verificação
                            </ThemedText>
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
                                value={token}
                                onChangeText={setToken}
                                placeholder="000000"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>
                                Nova senha
                            </ThemedText>
                            <View style={styles.passwordWrap}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        {
                                            backgroundColor: isDark
                                                ? colors.backgroundSelected
                                                : '#f8f8f8',
                                            borderColor:
                                                colors.backgroundElement,
                                            color: colors.text,
                                        },
                                    ]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Mín. 8 caracteres, com maiúscula, número e símbolo"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    <ThemedText
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {showPassword ? '🙈' : '👁'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>
                                Confirmar nova senha
                            </ThemedText>
                            <View style={styles.passwordWrap}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        {
                                            backgroundColor: isDark
                                                ? colors.backgroundSelected
                                                : '#f8f8f8',
                                            borderColor:
                                                colors.backgroundElement,
                                            color: colors.text,
                                        },
                                    ]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                >
                                    <ThemedText
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {showConfirmPassword ? '🙈' : '👁'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
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
                                    Redefinir senha
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
                                Não recebeu o código?{' '}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() =>
                                    router.replace('/forgot-password')
                                }
                            >
                                <ThemedText
                                    style={[
                                        styles.footerLinkAction,
                                        { color: colors.tint },
                                    ]}
                                >
                                    Solicitar novamente
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
    passwordWrap: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 44,
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
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
