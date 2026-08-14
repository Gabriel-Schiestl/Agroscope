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
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Preencha todos os campos.');
            return;
        }
        setError('');
        const result = await login(email, password);
        if (result.success) {
            router.replace('/analytics');
        } else if (result.blocked) {
            setError(
                'Sua conta foi bloqueada por excesso de tentativas incorretas. Entre em contato com o suporte.',
            );
        } else {
            setError('Email ou senha inválidos. Tente novamente.');
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
                    {/* Card */}
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
                        {/* Brand */}
                        <ThemedText
                            style={[styles.brand, { color: colors.tint }]}
                        >
                            AgroScope
                        </ThemedText>
                        <ThemedText style={styles.cardTitle}>Entrar</ThemedText>
                        <ThemedText
                            style={[
                                styles.cardSubtitle,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Entre com sua conta para acessar o sistema
                        </ThemedText>

                        {/* Error */}
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

                        {/* Email */}
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

                        {/* Password */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <ThemedText style={styles.label}>
                                    Senha
                                </ThemedText>
                                <TouchableOpacity>
                                    <ThemedText
                                        style={[
                                            styles.forgotLink,
                                            { color: colors.tint },
                                        ]}
                                    >
                                        Esqueceu a senha?
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
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
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
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

                        {/* Submit */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.tint },
                                isLoading && { opacity: 0.7 },
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.submitBtnText}>
                                    Entrar
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View
                                style={[
                                    styles.dividerLine,
                                    { backgroundColor: colors.backgroundElement },
                                ]}
                            />
                            <ThemedText
                                style={[
                                    styles.dividerText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                ou continue com
                            </ThemedText>
                            <View
                                style={[
                                    styles.dividerLine,
                                    { backgroundColor: colors.backgroundElement },
                                ]}
                            />
                        </View>

                        {/* Google (stub) */}
                        <TouchableOpacity
                            style={[
                                styles.googleBtn,
                                {
                                    borderColor: colors.backgroundElement,
                                    backgroundColor: isDark
                                        ? colors.backgroundSelected
                                        : '#fff',
                                },
                            ]}
                        >
                            <ThemedText style={styles.googleBtnText}>
                                G  Google
                            </ThemedText>
                        </TouchableOpacity>

                        {/* Footer link */}
                        <View style={styles.footerLink}>
                            <ThemedText
                                style={[
                                    styles.footerLinkText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Não tem uma conta?{' '}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => router.replace('/signup')}
                            >
                                <ThemedText
                                    style={[
                                        styles.footerLinkAction,
                                        { color: colors.tint },
                                    ]}
                                >
                                    Cadastre-se
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    forgotLink: {
        fontSize: 12,
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
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    googleBtn: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    googleBtnText: {
        fontSize: 14,
        fontWeight: '500',
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
