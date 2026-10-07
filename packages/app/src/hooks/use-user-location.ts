import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export interface UserCoords {
    latitude: number;
    longitude: number;
}

export type UserLocationStatus =
    | 'requesting'
    | 'granted'
    | 'denied'
    | 'unavailable';

// Posições com até 10 min servem: o clima é consultado por região, não pelo
// ponto exato, e evita esperar um fix de GPS a cada análise.
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * Solicita a permissão de localização e obtém a posição do usuário, usada
 * para validar o diagnóstico com o clima da região.
 */
export function useUserLocation() {
    const [coords, setCoords] = useState<UserCoords | null>(null);
    const [status, setStatus] = useState<UserLocationStatus>('requesting');

    const request = useCallback(async () => {
        setStatus('requesting');
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                setStatus('denied');
                return;
            }

            const lastKnown = await Location.getLastKnownPositionAsync({
                maxAge: LAST_KNOWN_MAX_AGE_MS,
            }).catch(() => null);
            const position =
                lastKnown ??
                (await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                }));

            setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setStatus('granted');
        } catch {
            // GPS desligado, timeout ou navegador sem suporte.
            setStatus('unavailable');
        }
    }, []);

    useEffect(() => {
        request();
    }, [request]);

    const retry = useCallback(async () => {
        // Negada em definitivo: o SO não mostra mais o prompt, só as
        // configurações do app.
        if (Platform.OS !== 'web') {
            const current = await Location.getForegroundPermissionsAsync();
            if (current.status !== 'granted' && !current.canAskAgain) {
                Linking.openSettings();
                return;
            }
        }
        request();
    }, [request]);

    return { coords, status, retry };
}
