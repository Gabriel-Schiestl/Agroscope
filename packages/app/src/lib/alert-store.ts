export interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

export interface AlertRequest {
    title: string;
    message?: string;
    buttons: AlertButton[];
}

type Listener = (request: AlertRequest | null) => void;

let current: AlertRequest | null = null;
const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((listener) => listener(current));
}

export function showAlertRequest(
    title: string,
    message?: string,
    buttons?: AlertButton[],
) {
    current = {
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
    };
    notify();
}

export function dismissAlert() {
    current = null;
    notify();
}

export function subscribeAlert(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getCurrentAlert() {
    return current;
}
