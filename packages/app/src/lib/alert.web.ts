import type { AlertButton } from './alert-store';
import { showAlertRequest } from './alert-store';

// Web: `Alert.alert` do react-native-web é `static alert() {}` — um no-op
// literal, sem diálogo e sem disparar os callbacks dos botões. Isso deixava
// qualquer confirmação (ex.: botão "Contratar" na tela de planos) sem
// nenhum efeito no PWA. Aqui, o pedido de alerta vai para um store simples
// que o <AlertHost /> (montado uma vez no layout raiz) observa e renderiza
// como um Modal de verdade.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
    showAlertRequest(title, message, buttons);
}
