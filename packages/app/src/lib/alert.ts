import { Alert } from 'react-native';
import type { AlertButton } from './alert-store';

// Nativo: o diálogo de sistema do RN funciona normalmente aqui.
// A contraparte `.web.ts` existe porque `Alert.alert` do react-native-web é
// um no-op (não mostra nada e nunca dispara os callbacks dos botões) — ver
// aquele arquivo para os detalhes.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
    Alert.alert(title, message, buttons);
}
