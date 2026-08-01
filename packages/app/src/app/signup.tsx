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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

const TERMS_TEXT = `Termos de Uso e Consentimento para Tratamento de Dados (LGPD)

O AgroScope trata seus dados pessoais e as imagens de plantas que você envia para análise em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

Dados coletados: nome, e-mail, senha e as imagens enviadas para diagnóstico, incluindo o histórico das análises realizadas.

Finalidade: as imagens são utilizadas exclusivamente para processamento no serviço de inteligência artificial do AgroScope, com o objetivo de identificar doenças nas plantas e gerar o diagnóstico solicitado por você, além de manter o histórico de análises da sua conta.

Compartilhamento: as imagens são compartilhadas apenas com o serviço interno de inteligência artificial do AgroScope. Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.

Seus direitos: você pode, a qualquer momento, solicitar acesso, correção ou exclusão dos seus dados, além de revogar este consentimento, entrando em contato pelo e-mail privacidade@agroscope.com. A revogação pode implicar a impossibilidade de continuar utilizando funcionalidades que dependem do envio de imagens.

Ao aceitar este termo, você consente com o tratamento dos seus dados pessoais e das imagens enviadas para análise, nos termos aqui descritos.`;

export default function SignupScreen() {
    const router = useRouter();
    const { signup, isLoading } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setError('Preencha todos os campos.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!acceptedTerms) {
            setError(
                'Você precisa aceitar os termos de uso e a política de privacidade.',
            );
            return;
        }
        setError('');
        const success = await signup(name, email, password, acceptedTerms);
        if (success) {
            router.replace('/analytics');
        } else {
            setError('Erro ao criar conta. Tente novamente.');
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
                        <ThemedText
                            style={[styles.backBtn, { color: colors.tint }]}
                        >
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
                        {/* Brand */}
                        <ThemedText
                            style={[styles.brand, { color: colors.tint }]}
                        >
                            AgroScope
                        </ThemedText>
                        <ThemedText style={styles.cardTitle}>
                            Criar Conta
                        </ThemedText>
                        <ThemedText
                            style={[
                                styles.cardSubtitle,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Crie sua conta para começar a usar o sistema
                        </ThemedText>

                        {/* Error */}
                        {!!error && (
                            <View style={styles.errorBox}>
                                <ThemedText style={styles.errorText}>
                                    {error}
                                </ThemedText>
                            </View>
                        )}

                        {/* Name */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Nome</ThemedText>
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
                                value={name}
                                onChangeText={setName}
                                placeholder="Seu nome completo"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="words"
                            />
                        </View>

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
                            <ThemedText style={styles.label}>Senha</ThemedText>
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
                                    placeholder="Mínimo 6 caracteres"
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

                        {/* Terms acceptance */}
                        <View style={styles.termsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    {
                                        borderColor: colors.tint,
                                        backgroundColor: acceptedTerms
                                            ? colors.tint
                                            : 'transparent',
                                    },
                                ]}
                                onPress={() =>
                                    setAcceptedTerms(!acceptedTerms)
                                }
                                accessibilityRole="checkbox"
                                accessibilityState={{
                                    checked: acceptedTerms,
                                }}
                            >
                                {acceptedTerms && (
                                    <ThemedText style={styles.checkboxMark}>
                                        ✓
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                            <View style={styles.termsTextWrap}>
                                <ThemedText
                                    style={[
                                        styles.termsText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Li e aceito os{' '}
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => setShowTermsModal(true)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.termsLink,
                                            { color: colors.tint },
                                        ]}
                                    >
                                        Termos de Uso e Consentimento LGPD
                                    </ThemedText>
                                </TouchableOpacity>
                                <ThemedText
                                    style={[
                                        styles.termsText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {' '}
                                    sobre o tratamento dos meus dados e
                                    imagens.
                                </ThemedText>
                            </View>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.tint },
                                isLoading && { opacity: 0.7 },
                            ]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.submitBtnText}>
                                    Criar Conta
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        {/* Footer link */}
                        <View style={styles.footerLink}>
                            <ThemedText
                                style={[
                                    styles.footerLinkText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Já tem uma conta?{' '}
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

            <Modal
                visible={showTermsModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={styles.termsModalOverlay}>
                    <View
                        style={[
                            styles.termsModalCard,
                            {
                                backgroundColor: isDark
                                    ? colors.backgroundElement
                                    : '#fff',
                            },
                        ]}
                    >
                        <ThemedText style={styles.termsModalTitle}>
                            Termos de Uso e Consentimento LGPD
                        </ThemedText>
                        <ScrollView style={styles.termsModalScroll}>
                            <ThemedText
                                style={[
                                    styles.termsModalBody,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {TERMS_TEXT}
                            </ThemedText>
                        </ScrollView>
                        <TouchableOpacity
                            style={[
                                styles.termsModalCloseBtn,
                                { backgroundColor: colors.tint },
                            ]}
                            onPress={() => setShowTermsModal(false)}
                        >
                            <ThemedText style={styles.submitBtnText}>
                                Fechar
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderColor: '#f87171',
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
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 1,
    },
    checkboxMark: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 13,
        fontWeight: '700',
    },
    termsTextWrap: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    termsText: {
        fontSize: 13,
        lineHeight: 18,
    },
    termsLink: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },
    termsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    termsModalCard: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    termsModalTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    termsModalScroll: {
        marginBottom: 16,
    },
    termsModalBody: {
        fontSize: 13,
        lineHeight: 20,
    },
    termsModalCloseBtn: {
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitBtn: {
        borderRadius: 8,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 20,
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
