import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useToast } from 'expo-toast';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { showAlert } from '@/lib/alert';
import { formatPersonName, NAME_MAX_LENGTH } from '@/lib/user-profile';
import api from '@/shared/http/http.config';

export default function AccountScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const isDark = colorScheme === 'dark';
    const toast = useToast();
    const { auth, refreshAuth, logout } = useAuth();

    const [name, setName] = useState(auth?.name ?? '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (auth?.name) setName(auth.name);
    }, [auth?.name]);

    const formattedName = formatPersonName(name);
    const canSave =
        formattedName.length >= 2 && formattedName !== (auth?.name ?? '') && !saving;

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/user', { name: formattedName });
            setName(formattedName);
            await refreshAuth();
            toast.show('Nome atualizado.');
        } catch (e: any) {
            const message = e?.response?.data?.message;
            showAlert(
                'Erro',
                typeof message === 'string' ? message : 'Não foi possível salvar o nome.',
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete('/user');
            logout();
            toast.show('Sua conta e seus dados foram excluídos.');
            router.replace('/');
        } catch {
            showAlert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
        } finally {
            setDeleting(false);
        }
    };

    const handleDelete = () => {
        showAlert(
            'Excluir conta definitivamente?',
            'Sua conta, o histórico de análises (com as imagens) e as conversas com a Íris serão apagados. Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: deleteAccount },
            ],
        );
    };

    const inputStyle = [
        styles.input,
        {
            backgroundColor: isDark ? colors.backgroundSelected : '#f8f8f8',
            borderColor: colors.backgroundElement,
            color: colors.text,
        },
    ];

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={() =>
                            router.canGoBack() ? router.back() : router.replace('/analytics')
                        }
                    >
                        <ThemedText style={[styles.backBtn, { color: colors.tint }]}>
                            ← Voltar
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.pageTitle}>
                    <ThemedText style={styles.title}>Minha conta</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Seus dados pessoais e de acesso ao AgroScope
                    </ThemedText>
                </View>

                <ThemedView
                    type="backgroundElement"
                    style={[styles.card, { borderColor: colors.backgroundElement }]}
                >
                    <ThemedText style={styles.label}>Nome completo</ThemedText>
                    <TextInput
                        style={inputStyle}
                        value={name}
                        onChangeText={setName}
                        onBlur={() => setName(formattedName)}
                        maxLength={NAME_MAX_LENGTH}
                        autoCapitalize="words"
                        placeholder="Seu nome completo"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <ThemedText style={[styles.label, { marginTop: 14 }]}>Email</ThemedText>
                    <ThemedText style={{ color: colors.textSecondary }}>
                        {auth?.email || '—'}
                    </ThemedText>

                    <TouchableOpacity
                        style={[
                            styles.primaryBtn,
                            { backgroundColor: colors.tint, opacity: canSave ? 1 : 0.5 },
                        ]}
                        onPress={handleSave}
                        disabled={!canSave}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText style={styles.primaryBtnText}>Salvar</ThemedText>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkBtn}
                        onPress={() => router.push('/forgot-password')}
                    >
                        <ThemedText style={{ color: colors.tint, fontWeight: '500' }}>
                            Alterar senha
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView
                    type="backgroundElement"
                    style={[styles.card, styles.dangerCard]}
                >
                    <ThemedText style={[styles.cardTitle, { color: '#ef4444' }]}>
                        Excluir conta
                    </ThemedText>
                    <ThemedText style={[styles.dangerText, { color: colors.textSecondary }]}>
                        Remove sua conta, o histórico de análises e as conversas com a Íris.
                        Essa ação não pode ser desfeita.
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.dangerBtn}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnRow}>
                                <Trash2 size={15} color="#fff" />
                                <ThemedText style={styles.primaryBtnText}>
                                    Excluir minha conta
                                </ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>
                </ThemedView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    topBar: { paddingHorizontal: 20, paddingVertical: 12 },
    backBtn: { fontSize: 14, fontWeight: '500' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    pageTitle: { marginTop: 8, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 13 },
    card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
    cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    primaryBtn: {
        marginTop: 18,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '600' },
    linkBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 6 },
    dangerCard: { borderColor: 'rgba(239,68,68,0.4)' },
    dangerText: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
    dangerBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
