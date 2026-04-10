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
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import api from '@/shared/http/http.config';
import { useAuth } from '@/contexts/auth-context';
import type { History } from '@/models/History';

interface ChatMessageDto {
    id: string;
    content: string;
    sender: 'human' | 'ai';
    userId: string;
    sessionId: string;
    createdAt: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface PlanLimit {
    chatRequests: number;
    chatLimit: number;
}

interface ChatModalProps {
    visible: boolean;
    analysis: History | null;
    onClose: () => void;
    limit?: PlanLimit | null;
}

function dtoToMessage(dto: ChatMessageDto): ChatMessage {
    return {
        id: dto.id,
        role: dto.sender === 'human' ? 'user' : 'assistant',
        content: dto.content,
        timestamp: new Date(dto.createdAt),
    };
}

function buildInitialMessage(analysis: History | null): ChatMessage {
    const disease = analysis?.explanation ?? analysis?.crop ?? 'a cultura analisada';
    const crop = analysis?.crop ?? '';
    const confidence = analysis?.sicknessConfidence
        ? ` (${(analysis.sicknessConfidence * 100).toFixed(1)}% de confiança)`
        : '';

    return {
        id: 'init',
        role: 'assistant',
        content: `Olá! Sou seu assistente agrícola. Identifiquei **${disease}**${confidence} em **${crop}**.\n\nPosso ajudá-lo com dúvidas sobre:\n• Manejo e controle da doença\n• Causas e condições favoráveis\n• Produtos e aplicações\n• Prevenção futura\n\nO que gostaria de saber?`,
        timestamp: new Date(),
    };
}

export function ChatModal({ visible, analysis, onClose, limit }: ChatModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[isDark ? 'dark' : 'light'];
    const { token } = useAuth();
    const [limitError, setLimitError] = useState<string | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(300)).current;
    const socketRef = useRef<Socket | null>(null);

    const hasNoChatAccess = limit != null && limit.chatLimit === 0;
    const hasReachedLimit = limit != null && limit.chatLimit > 0 && limit.chatRequests >= limit.chatLimit;
    const isChatBlocked = hasNoChatAccess || hasReachedLimit;
    const remainingMessages = limit != null && limit.chatLimit > 0
        ? Math.max(0, limit.chatLimit - limit.chatRequests)
        : null;

    useEffect(() => {
        if (visible && analysis) {
            setInputText('');
            setIsTyping(false);

            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();

            const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

            const socket = io(`${apiUrl}/chat`, {
                transports: ['websocket', 'polling'],
                auth: token ? { token } : undefined,
            });

            socketRef.current = socket;

            socket.on('connect', () => setIsConnected(true));
            socket.on('disconnect', () => setIsConnected(false));

            // Load chat history, fall back to greeting if none
            api
                .get<ChatMessageDto[]>('/chat/history', {
                    params: { sessionId: analysis.id },
                })
                .then((res) => {
                    if (res.data.length > 0) {
                        setMessages(res.data.map(dtoToMessage));
                    } else {
                        setMessages([buildInitialMessage(analysis)]);
                    }
                })
                .catch(() => {
                    setMessages([buildInitialMessage(analysis)]);
                });
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                socketRef.current?.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            });
        }

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [visible, analysis]);

    const scrollToBottom = () => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const sendMessage = () => {
        const text = inputText.trim();
        if (!text || isTyping || !socketRef.current || !analysis) return;

        setInputText('');
        setIsTyping(true);
        setLimitError(null);
        scrollToBottom();

        socketRef.current.emit(
            'send_message',
            { content: text, sessionId: analysis.id },
            (response: { userMessage: ChatMessageDto; aiMessage: ChatMessageDto } | { error: string }) => {
                if ('error' in response) {
                    setLimitError(response.error);
                    setIsTyping(false);
                    return;
                }
                setMessages((prev) => [
                    ...prev,
                    dtoToMessage(response.userMessage),
                    dtoToMessage(response.aiMessage),
                ]);
                setIsTyping(false);
                scrollToBottom();
            },
        );
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
                                <View style={styles.headerRight}>
                                    <View
                                        style={[
                                            styles.statusDot,
                                            { backgroundColor: isConnected ? '#22c55e' : '#94a3b8' },
                                        ]}
                                    />
                                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                        <ThemedText style={[styles.closeBtnText, { color: colors.textSecondary }]}>
                                            ✕
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
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
                                {isChatBlocked ? (
                                    <View style={[styles.blockedBanner, { backgroundColor: isDark ? colors.backgroundElement : '#fef2f2', borderColor: '#fca5a5' }]}>
                                        <ThemedText style={[styles.blockedIcon]}>🔒</ThemedText>
                                        <ThemedText style={[styles.blockedText, { color: '#ef4444' }]}>
                                            {hasNoChatAccess
                                                ? 'Seu plano não inclui acesso ao chat. Faça upgrade para usar o assistente.'
                                                : `Limite de ${limit!.chatLimit} mensagens atingido. Faça upgrade para continuar.`}
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <>
                                        {limitError && (
                                            <ThemedText style={[styles.limitMsg, { color: '#ef4444' }]}>
                                                {limitError}
                                            </ThemedText>
                                        )}
                                        {remainingMessages !== null && remainingMessages <= 10 && (
                                            <ThemedText style={[styles.limitMsg, { color: colors.textSecondary }]}>
                                                {remainingMessages} {remainingMessages === 1 ? 'mensagem restante' : 'mensagens restantes'}
                                            </ThemedText>
                                        )}
                                        <View style={styles.inputInner}>
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
                                                editable={!isTyping && isConnected}
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.sendBtn,
                                                    {
                                                        backgroundColor:
                                                            inputText.trim() && !isTyping && isConnected
                                                                ? colors.tint
                                                                : colors.backgroundSelected,
                                                    },
                                                ]}
                                                onPress={sendMessage}
                                                disabled={!inputText.trim() || isTyping || !isConnected}
                                            >
                                                <ThemedText style={styles.sendIcon}>↑</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
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
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.two,
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
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
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
            flexDirection: 'column',
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
        inputInner: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: Spacing.two,
        },
        limitMsg: {
            fontSize: 12,
            textAlign: 'center',
            paddingBottom: 6,
        },
        blockedBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            marginBottom: 4,
        },
        blockedIcon: {
            fontSize: 18,
        },
        blockedText: {
            flex: 1,
            fontSize: 13,
            lineHeight: 18,
        },
    });
}
