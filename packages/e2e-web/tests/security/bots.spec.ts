import { test, expect } from '@playwright/test';
import { API_PREFIX, BASE_URL } from '../../support/env';

// ─────────────────────────────────────────────────────────────────────────────
// Testes E2E de Segurança — Bots, na stack completa
//
// Crawlers "confiáveis" (Googlebot, Bingbot) e automações (HeadlessChrome,
// curl) não podem ter tratamento especial: sem sessão, as páginas protegidas
// redirecionam para o login e a API responde 401, qualquer que seja o
// User-Agent. O rate limiting em si é testado no backend
// (backend/test/security/Bots.e2e-spec.ts), porque a stack de teste usa
// limites altos de propósito.
// ─────────────────────────────────────────────────────────────────────────────

const BOT_USER_AGENTS = {
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  HeadlessChrome:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
  curl: 'curl/8.4.0',
};

const PROTECTED_PAGES = ['/analytics', '/history', '/settings'];

for (const [botName, userAgent] of Object.entries(BOT_USER_AGENTS)) {
  test.describe(`Segurança — Bot "${botName}" sem sessão`, () => {
    test.use({ userAgent });

    for (const path of PROTECTED_PAGES) {
      test(`página protegida ${path} redireciona para /login`, async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveURL(/\/login/);
      });
    }

    test('API protegida responde 401 e não devolve dados', async ({ request }) => {
      for (const route of ['/history', '/auth/validate', '/limit', '/chat/sessions']) {
        const response = await request.get(`${BASE_URL}${API_PREFIX}${route}`, {
          headers: { 'User-Agent': userAgent },
        });
        expect(response.status()).toBe(401);
      }
    });
  });
}
