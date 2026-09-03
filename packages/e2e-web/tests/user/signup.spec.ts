import { test, expect } from '../../fixtures';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { signup as apiSignup } from '../../support/api-client';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from '../../support/test-data';

test.describe('Módulo: Usuário — Cadastro', () => {
  test('CT-13 - cadastro com dados válidos e login em seguida', async ({ page }) => {
    const email = uniqueEmail('signup-ok');
    const name = uniqueName('João Silva');

    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup({ name, email, password: VALID_PASSWORD });

    await expect(page).toHaveURL(/\/login/);

    const loginPage = new LoginPage(page);
    await loginPage.login(email, VALID_PASSWORD);
    await expect(page).toHaveURL(/\/analytics/);
  });

  test('CT-14 - cadastro com e-mail já existente é recusado', async ({
    page,
    apiContext,
  }) => {
    const email = uniqueEmail('signup-dup');
    await apiSignup(apiContext, { name: 'Já Cadastrado', email, password: VALID_PASSWORD });

    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup({ name: 'Outro Nome', email, password: 'OutraSenha@123' });

    await expect(signupPage.errorAlert).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('CT-15 - cadastro com nome e senha em branco é bloqueado pelo navegador', async ({
    page,
  }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.fill({ email: uniqueEmail('signup-blank') });
    await signupPage.acceptTerms();
    await signupPage.submit();

    await expect(page).toHaveURL(/\/signup/);
    expect(
      await signupPage.nameInput.evaluate((el: HTMLInputElement) => el.validity.valid),
    ).toBe(false);
    expect(
      await signupPage.passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid),
    ).toBe(false);
  });

  test('CT-16 - cadastro com e-mail em formato inválido é bloqueado pelo navegador', async ({
    page,
  }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.signup({
      name: 'João',
      email: 'emailinvalido',
      password: VALID_PASSWORD,
    });

    await expect(page).toHaveURL(/\/signup/);
    expect(
      await signupPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid),
    ).toBe(false);
  });
});
