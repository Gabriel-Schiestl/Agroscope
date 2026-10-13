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

// Sem timeout, um GPS sem fix deixa a tela em "Obtendo localização" para sempre.
const POSITION_TIMEOUT_MS = 10 * 1000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error('location timeout')),
            POSITION_TIMEOUT_MS,
        );
        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (error) => {
                clearTimeout(timer);
                reject(error);
            },
        );
    });
}

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

            const lastKnown = await withTimeout(
                Location.getLastKnownPositionAsync({
                    maxAge: LAST_KNOWN_MAX_AGE_MS,
                }),
            ).catch(() => null);
            const position =
                lastKnown ??
                (await withTimeout(
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    }),
                ).catch(() =>
                    // Sem fix de GPS a tempo: aceita uma posição aproximada.
                    withTimeout(
                        Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.Lowest,
                        }),
                    ),
                ));

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
