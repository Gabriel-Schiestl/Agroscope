import type { FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost';
const MAX_WAIT_MS = 120_000;
const POLL_INTERVAL_MS = 2_000;

async function waitForUrl(url: string, label: string): Promise<void> {
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // ainda subindo, tenta de novo
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `[global-setup] ${label} não respondeu em ${url} após ${MAX_WAIT_MS}ms. ` +
      'Confirme que a stack está de pé: docker compose -f docker-compose.test.yml up -d --build',
  );
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  console.log(`[global-setup] Aguardando backend em ${BASE_URL}/api/hello ...`);
  await waitForUrl(`${BASE_URL}/api/hello`, 'backend');

  console.log(`[global-setup] Aguardando frontend em ${BASE_URL}/login ...`);
  await waitForUrl(`${BASE_URL}/login`, 'frontend (via nginx)');

  console.log('[global-setup] Stack pronta.');
}
