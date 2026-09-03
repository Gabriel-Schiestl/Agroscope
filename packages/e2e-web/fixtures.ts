import {
  test as base,
  expect,
  request as pwRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { BASE_URL } from './support/env';
import { signup, loginOrThrow } from './support/api-client';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from './support/test-data';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

type Fixtures = {
  /** APIRequestContext isolado, sem usuário nenhum ainda — útil para os próprios testes de signup/login. */
  apiContext: APIRequestContext;

  /** Usuário cadastrado via API (POST /user real), ainda deslogado. Plano FREE é atribuído automaticamente pelo backend. */
  newUser: TestUser;

  /** Usuário cadastrado E logado via API — `apiContext` já carrega o cookie de sessão para chamadas de arranjo (seed de histórico, chat, etc). */
  authedUser: { user: TestUser; apiContext: APIRequestContext };

  /** Página de browser já autenticada (cookie de sessão injetado), pronta a partir de about:blank — o teste decide para onde navegar. */
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  apiContext: async ({}, use) => {
    const context = await pwRequest.newContext({ baseURL: BASE_URL });
    await use(context);
    await context.dispose();
  },

  newUser: async ({ apiContext }, use) => {
    const user: TestUser = {
      name: uniqueName(),
      email: uniqueEmail(),
      password: VALID_PASSWORD,
    };
    await signup(apiContext, user);
    await use(user);
  },

  authedUser: async ({ apiContext, newUser }, use) => {
    await loginOrThrow(apiContext, newUser.email, newUser.password);
    await use({ user: newUser, apiContext });
  },

  authedPage: async ({ browser, authedUser }, use) => {
    const storageState = await authedUser.apiContext.storageState();
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
