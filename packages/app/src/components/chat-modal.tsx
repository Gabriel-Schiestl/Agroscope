import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    useColorScheme,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { History } from '@/models/History';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatModalProps {
    visible: boolean;
    analysis: History | null;
    onClose: () => void;
}

const MOCK_RESPONSES: Record<string, string> = {
    default:
        'Entendo sua dúvida! Com base na análise realizada, posso ajudá-lo com informações sobre o diagnóstico, causas da doença e recomendações de manejo. O que gostaria de saber?',
    manejo:
        'Para o manejo desta doença, é fundamental aplicar os fungicidas recomendados no período correto. Lembre-se de respeitar os intervalos de segurança e consultar um agrônomo da sua região para adaptar as recomendações ao seu contexto específico.',
    causa:
        'As principais causas desta doença estão relacionadas às condições climáticas favoráveis ao patógeno, como alta umidade relativa e temperaturas adequadas. O monitoramento constante da lavoura é essencial para identificar os primeiros sintomas.',
    fungicid:
        'A escolha do fungicida deve levar em conta o ingrediente ativo, o espectro de ação e o histórico de resistência na sua região. Recomendo consultar a receita agronômica e seguir as instruções do rótulo do produto.',
    sintoma:
        'Os sintomas visíveis na imagem são característicos da doença identificada. Observe principalmente as lesões nas folhas e monitore a progressão. Caso os sintomas se intensifiquem, reforce o programa de proteção da lavoura.',
    prevenc:
        'A prevenção é sempre mais eficiente do que o controle curativo. Utilize cultivares resistentes quando disponíveis, faça rotação de culturas, elimine restos culturais e adote o manejo integrado de pragas e doenças.',
    clima:
        'As condições climáticas têm papel fundamental no desenvolvimento desta doença. Fique atento às previsões meteorológicas e ajuste seu programa de proteção nos períodos de maior risco (alta umidade e temperatura favorável).',
    confianca:
        'A porcentagem de confiança indica a certeza do modelo de IA na identificação. Valores acima de 85% são considerados altos. Independentemente da confiança, sempre confirme o diagnóstico com um profissional agrônomo.',
};

function getMockResponse(question: string, analysis: History | null): string {
    const lower = question.toLowerCase();

    if (lower.includes('manejo') || lower.includes('controle') || lower.includes('tratamento')) {
        return `${MOCK_RESPONSES.manejo}\n\nPara ${analysis?.crop ?? 'sua cultura'}: ${analysis?.handling ?? ''}`;
    }
    if (lower.includes('causa') || lower.includes('origem') || lower.includes('por que')) {
        return `${MOCK_RESPONSES.causa}\n\nNeste caso: ${analysis?.causes ?? ''}`;
    }
    if (lower.includes('fungicid') || lower.includes('produto') || lower.includes('aplicac')) {
        return MOCK_RESPONSES.fungicid;
    }
    if (lower.includes('sintoma') || lower.includes('folha') || lower.includes('lesão') || lower.includes('lesao')) {
        return MOCK_RESPONSES.sintoma;
    }
    if (lower.includes('prevenc') || lower.includes('prevenir') || lower.includes('evitar')) {
        return MOCK_RESPONSES.prevenc;
    }
    if (lower.includes('clima') || lower.includes('chuva') || lower.includes('umidade') || lower.includes('temperatura')) {
        return MOCK_RESPONSES.clima;
    }
    if (lower.includes('confiança') || lower.includes('confianca') || lower.includes('porcentagem') || lower.includes('%')) {
        return MOCK_RESPONSES.confianca;
    }

    return MOCK_RESPONSES.default;
}

function buildInitialMessage(analysis: History | null): ChatMessage {
    const disease = analysis?.explanation ?? analysis?.crop ?? 'a cultura analisada';
    const crop = analysis?.crop ?? '';
    const confidence = analysis?.sicknessConfidence
        ? ` (${analysis.sicknessConfidence.toFixed(1)}% de confiança)`
        : '';

    return {
        id: 'init',
        role: 'assistant',
        content: `Olá! Sou seu assistente agrícola. Identifiquei **${disease}**${confidence} em **${crop}**.\n\nPosso ajudá-lo com dúvidas sobre:\n• Manejo e controle da doença\n• Causas e condições favoráveis\n• Produtos e aplicações\n• Prevenção futura\n\nO que gostaria de saber?`,
        timestamp: new Date(),
    };
}

export function ChatModal({ visible, analysis, onClose }: ChatModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[isDark ? 'dark' : 'light'];

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible && analysis) {
            setMessages([buildInitialMessage(analysis)]);
            setInputText('');
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, analysis]);

    const scrollToBottom = () => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const sendMessage = () => {
        const text = inputText.trim();
        if (!text || isTyping) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        scrollToBottom();

        // Simula delay de resposta da IA
        setTimeout(() => {
            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getMockResponse(text, analysis),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setIsTyping(false);
            scrollToBottom();
        }, 1200 + Math.random() * 800);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const styles = makeStyles(colors, isDark);

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

                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
                >
                    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerHandle} />
                            <View style={styles.headerContent}>
                                <View style={styles.headerLeft}>
                                    <View style={[styles.avatarDot, { backgroundColor: colors.tint }]} />
                                    <View>
                                        <ThemedText style={styles.headerTitle}>
                                            Assistente AgroScope
                                        </ThemedText>
                                        <ThemedText
                                            style={[styles.headerSub, { color: colors.textSecondary }]}
                                        >
                                            {analysis?.crop
                                                ? `${analysis.crop} · ${new Date(analysis.createdAt).toLocaleDateString('pt-BR')}`
                                                : 'Nova análise'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <ThemedText style={[styles.closeBtnText, { color: colors.textSecondary }]}>
                                        ✕
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Messages */}
                        <KeyboardAvoidingView
                            style={styles.flex}
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            keyboardVerticalOffset={0}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.messagesList}
                                contentContainerStyle={styles.messagesContent}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={scrollToBottom}
                            >
                                {messages.map((msg) => (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageRow,
                                            msg.role === 'user'
                                                ? styles.messageRowUser
                                                : styles.messageRowAssistant,
                                        ]}
                                    >
                                        {msg.role === 'assistant' && (
                                            <View
                                                style={[
                                                    styles.assistantAvatar,
                                                    { backgroundColor: colors.tint + '20' },
                                                ]}
                                            >
                                                <ThemedText style={styles.assistantAvatarIcon}>
                                                    🌱
                                                </ThemedText>
                                            </View>
                                        )}
                                        <View
                                            style={[
                                                styles.bubble,
                                                msg.role === 'user'
                                                    ? [
                                                          styles.bubbleUser,
                                                          { backgroundColor: colors.tint },
                                                      ]
                                                    : [
                                                          styles.bubbleAssistant,
                                                          {
                                                              backgroundColor: isDark
                                                                  ? colors.backgroundElement
                                                                  : '#f0f0f3',
                                                              borderColor: isDark
                                                                  ? colors.backgroundSelected
                                                                  : '#e0e0e3',
                                                          },
                                                      ],
                                            ]}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.bubbleText,
                                                    msg.role === 'user' && styles.bubbleTextUser,
                                                ]}
                                            >
                                                {msg.content}
                                            </ThemedText>
                                            <ThemedText
                                                style={[
                                                    styles.bubbleTime,
                                                    {
                                                        color:
                                                            msg.role === 'user'
                                                                ? 'rgba(255,255,255,0.65)'
                                                                : colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {formatTime(msg.timestamp)}
                                            </ThemedText>
                                        </View>
                                    </View>
                                ))}

                                {isTyping && (
                                    <View style={[styles.messageRow, styles.messageRowAssistant]}>
                                        <View
                                            style={[
                                                styles.assistantAvatar,
                                                { backgroundColor: colors.tint + '20' },
                                            ]}
                                        >
                                            <ThemedText style={styles.assistantAvatarIcon}>🌱</ThemedText>
                                        </View>
                                        <View
                                            style={[
                                                styles.bubble,
                                                styles.bubbleAssistant,
                                                styles.bubbleTyping,
                                                {
                                                    backgroundColor: isDark
                                                        ? colors.backgroundElement
                                                        : '#f0f0f3',
                                                    borderColor: isDark
                                                        ? colors.backgroundSelected
                                                        : '#e0e0e3',
                                                },
                                            ]}
                                        >
                                            <ActivityIndicator size="small" color={colors.tint} />
                                        </View>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Input */}
                            <View
                                style={[
                                    styles.inputRow,
                                    {
                                        borderTopColor: isDark
                                            ? colors.backgroundSelected
                                            : '#e8e8eb',
                                        backgroundColor: isDark ? colors.background : '#fff',
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: isDark
                                                ? colors.backgroundElement
                                                : '#f5f5f8',
                                            color: colors.text,
                                            borderColor: isDark
                                                ? colors.backgroundSelected
                                                : '#e0e0e3',
                                        },
                                    ]}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Escreva sua dúvida..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    maxLength={500}
                                    returnKeyType="send"
                                    onSubmitEditing={sendMessage}
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendBtn,
                                        {
                                            backgroundColor:
                                                inputText.trim() && !isTyping
                                                    ? colors.tint
                                                    : colors.backgroundSelected,
                                        },
                                    ]}
                                    onPress={sendMessage}
                                    disabled={!inputText.trim() || isTyping}
                                >
                                    <ThemedText style={styles.sendIcon}>↑</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                </Animated.View>
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
        flex: {
            flex: 1,
        },
        // Header
        header: {
            paddingTop: Spacing.two,
            paddingBottom: Spacing.two,
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
            paddingHorizontal: Spacing.three,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.two,
            flex: 1,
        },
        avatarDot: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 15,
            fontWeight: '600',
        },
        headerSub: {
            fontSize: 12,
            marginTop: 1,
        },
        closeBtn: {
            padding: Spacing.two,
        },
        closeBtnText: {
            fontSize: 16,
            fontWeight: '500',
        },
        // Messages
        messagesList: {
            flex: 1,
        },
        messagesContent: {
            padding: Spacing.three,
            gap: Spacing.two,
            paddingBottom: Spacing.four,
        },
        messageRow: {
            flexDirection: 'row',
            marginBottom: Spacing.two,
            alignItems: 'flex-end',
            gap: Spacing.two,
        },
        messageRowUser: {
            justifyContent: 'flex-end',
        },
        messageRowAssistant: {
            justifyContent: 'flex-start',
        },
        assistantAvatar: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        assistantAvatarIcon: {
            fontSize: 15,
        },
        bubble: {
            maxWidth: '78%',
            borderRadius: 16,
            padding: Spacing.two + 4,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        bubbleUser: {
            borderBottomRightRadius: 4,
        },
        bubbleAssistant: {
            borderBottomLeftRadius: 4,
        },
        bubbleTyping: {
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.two + 2,
        },
        bubbleText: {
            fontSize: 14,
            lineHeight: 20,
        },
        bubbleTextUser: {
            color: '#ffffff',
        },
        bubbleTime: {
            fontSize: 10,
            marginTop: 4,
            alignSelf: 'flex-end',
        },
        // Input
        inputRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.two,
            borderTopWidth: 1,
            gap: Spacing.two,
        },
        input: {
            flex: 1,
            borderRadius: 20,
            borderWidth: 1,
            paddingHorizontal: Spacing.three,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 14,
            maxHeight: 100,
            lineHeight: 20,
        },
        sendBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        sendIcon: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 20,
        },
    });
}
