import type { APIRequestContext, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import { API_PREFIX } from './env';
import { IMAGE_FIXTURE_PATH } from './test-data';

/**
 * Helpers para preparar estado do sistema via chamadas HTTP reais (a mesma API
 * que o frontend consome), em vez de mexer direto no banco. Isso mantém os
 * testes como "system tests" de fato: tudo passa pelas interfaces reais do
 * sistema, só que sem repetir manualmente pela UI cada etapa de arranjo que
 * não é o foco do caso de teste em questão.
 *
 * `request` deve ser um APIRequestContext dedicado por usuário (ver fixtures.ts),
 * porque ele guarda os cookies de sessão automaticamente entre chamadas.
 */

export interface SignupParams {
  name: string;
  email: string;
  password: string;
}

export async function signup(
  request: APIRequestContext,
  params: SignupParams,
): Promise<void> {
  const response = await request.post(`${API_PREFIX}/user`, {
    data: { ...params, acceptedTerms: true },
  });
  if (!response.ok()) {
    throw new Error(
      `[api-client] signup falhou (${response.status()}): ${await response.text()}`,
    );
  }
}

export async function login(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<APIResponse> {
  return request.post(`${API_PREFIX}/auth/login`, {
    data: { email, password },
  });
}

export async function loginOrThrow(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  const response = await login(request, email, password);
  if (!response.ok()) {
    throw new Error(
      `[api-client] login falhou (${response.status()}): ${await response.text()}`,
    );
  }
}

export async function predictOnce(
  request: APIRequestContext,
  imagePath: string = IMAGE_FIXTURE_PATH,
): Promise<APIResponse> {
  return request.post(`${API_PREFIX}/predict`, {
    multipart: {
      image: {
        name: 'leaf.jpg',
        mimeType: 'image/jpeg',
        buffer: fs.readFileSync(imagePath),
      },
    },
  });
}

/** Chama /predict N vezes em sequência (usado para esgotar o limite de imagens do plano). */
export async function predictNTimes(
  request: APIRequestContext,
  n: number,
): Promise<APIResponse[]> {
  const responses: APIResponse[] = [];
  for (let i = 0; i < n; i++) {
    const response = await predictOnce(request);
    if (!response.ok()) {
      throw new Error(
        `[api-client] predict #${i + 1} falhou (${response.status()}): ${await response.text()}`,
      );
    }
    responses.push(response);
  }
  return responses;
}

export async function getHistory(request: APIRequestContext): Promise<any[]> {
  const response = await request.get(`${API_PREFIX}/history`);
  if (!response.ok()) {
    throw new Error(`[api-client] getHistory falhou (${response.status()})`);
  }
  return response.json();
}

export async function getLimit(request: APIRequestContext): Promise<{
  imageRequests: number;
  imageLimit: number;
  chatRequests: number;
  chatLimit: number;
  featureFlags: string[];
}> {
  const response = await request.get(`${API_PREFIX}/limit`);
  if (!response.ok()) {
    throw new Error(`[api-client] getLimit falhou (${response.status()})`);
  }
  return response.json();
}

/** Extrai o valor bruto do cookie de sessão do storageState de um APIRequestContext logado. */
export async function extractSessionToken(
  request: APIRequestContext,
): Promise<string> {
  const state = await request.storageState();
  const cookie = state.cookies.find(
    (c) => c.name === 'agroscope-authentication',
  );
  if (!cookie) {
    throw new Error(
      '[api-client] cookie agroscope-authentication não encontrado no storageState — o login foi feito nesse APIRequestContext?',
    );
  }
  return cookie.value;
}
