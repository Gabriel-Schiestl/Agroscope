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

Última atualização: 01 de agosto de 2026

Este texto descreve, em linguagem acessível, como o AgroScope trata os dados pessoais e as imagens enviadas por seus usuários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Este é um modelo de referência e deve ser revisado pelo setor jurídico responsável antes de sua utilização definitiva em produção.

1. Controlador dos dados
O AgroScope ("nós", "nosso sistema") é o controlador dos dados pessoais tratados por meio da plataforma, nos termos do art. 5º, VI, da LGPD, sendo responsável pelas decisões referentes ao tratamento dos dados pessoais dos usuários.

2. Dados coletados
Para prestar o serviço, coletamos e armazenamos:
- Dados de cadastro: nome, e-mail e senha (armazenada de forma criptografada).
- Imagens de plantas enviadas por você para análise e diagnóstico de doenças, incluindo os metadados associados a cada envio (data, resultado da análise, histórico).
- Dados de uso da plataforma, necessários para o funcionamento dos planos, limites de uso e histórico de análises.

3. Finalidade do tratamento
Os dados e imagens informados acima são utilizados para:
- Criar e autenticar sua conta na plataforma.
- Processar as imagens enviadas em nosso serviço de inteligência artificial, com a finalidade exclusiva de identificar doenças e gerar o diagnóstico solicitado por você.
- Manter um histórico das análises realizadas, para que você possa consultá-las posteriormente.
- Cumprir obrigações legais e regulatórias, quando aplicável.

4. Compartilhamento de dados
As imagens enviadas são compartilhadas apenas com o serviço interno de inteligência artificial do próprio AgroScope, responsável por processar o diagnóstico. Não vendemos, alugamos ou compartilhamos seus dados pessoais ou imagens com terceiros para fins comerciais ou publicitários.

5. Base legal
O tratamento dos seus dados pessoais e das imagens enviadas é realizado com fundamento na execução do contrato de prestação de serviço (art. 7º, V, da LGPD) e no seu consentimento livre, informado e inequívoco (art. 7º, I, da LGPD), manifestado no momento da criação da sua conta.

6. Retenção e exclusão dos dados
Seus dados e imagens são mantidos enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir as finalidades descritas neste termo. Você pode solicitar a exclusão da sua conta e dos dados associados a qualquer momento, através dos canais de contato indicados abaixo.

7. Seus direitos como titular dos dados
Nos termos do art. 18 da LGPD, você tem direito a, a qualquer momento e mediante requisição:
- Confirmar a existência de tratamento dos seus dados;
- Acessar seus dados;
- Corrigir dados incompletos, inexatos ou desatualizados;
- Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a LGPD;
- Solicitar a portabilidade dos seus dados;
- Eliminar os dados tratados com base no seu consentimento;
- Revogar o consentimento a qualquer momento, o que pode implicar a impossibilidade de continuar utilizando os serviços que dependem do uso das imagens enviadas.

8. Segurança das informações
Adotamos medidas técnicas e administrativas para proteger seus dados pessoais e as imagens enviadas contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito.

9. Contato
Em caso de dúvidas sobre este termo ou para exercer seus direitos como titular de dados, entre em contato com nosso encarregado de proteção de dados (DPO) pelo e-mail privacidade@agroscope.com.

10. Aceite
Ao marcar a opção de aceite no momento da criação da sua conta, você declara ter lido e compreendido este termo e consente, de forma livre, informada e inequívoca, com o tratamento dos seus dados pessoais e das imagens enviadas para análise, nos termos aqui descritos.`;

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE =
    'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';

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
        if (!PASSWORD_REGEX.test(password)) {
            setError(PASSWORD_MESSAGE);
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
