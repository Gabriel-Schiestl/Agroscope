'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export type GeolocationStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

// Posições com até 10 min servem: o clima é consultado por região, não pelo
// ponto exato.
const MAX_AGE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 15 * 1000;

/**
 * Solicita a permissão de localização do navegador e obtém a posição do
 * usuário, usada para validar o diagnóstico com o clima da região.
 * Requer contexto seguro (HTTPS ou localhost).
 */
export function useGeolocation() {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('requesting');

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('granted');
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, maximumAge: MAX_AGE_MS, timeout: TIMEOUT_MS },
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { coords, status, retry: request };
}
