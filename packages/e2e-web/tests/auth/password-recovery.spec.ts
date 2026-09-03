import { test, expect } from '../../fixtures';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { LoginPage } from '../../pages/LoginPage';
import { getRecoveryCode, expireRecoveryCode } from '../../support/db';
import { OTHER_VALID_PASSWORD } from '../../support/test-data';

test.describe('Módulo: Autenticação — Recuperação de senha', () => {
  test('CT-07 - solicitar recuperação com e-mail válido confirma o envio', async ({
    page,
    newUser,
  }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();

    await forgotPasswordPage.requestRecovery(newUser.email);

    // A API sempre retorna sucesso para não revelar se o e-mail existe na base
    // (ver PasswordRecovery.ts no frontend) — o efeito observável é o redirect.
    await expect(page).toHaveURL(
      new RegExp(`/reset-password\\?email=${encodeURIComponent(newUser.email)}`),
    );

    // O código de fato foi gerado e persistido no backend (não é possível ler
    // o e-mail enviado neste ambiente — ver nota em support/db.ts).
    await expect
      .poll(() => getRecoveryCode(newUser.email), { timeout: 10_000 })
      .toMatch(/^\d{6}$/);
  });

  test('CT-08 - inserir código de recuperação inválido é recusado', async ({
    page,
    newUser,
  }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestRecovery(newUser.email);
    await expect(page).toHaveURL(/\/reset-password/);

    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.resetPassword({
      token: '000000',
      newPassword: OTHER_VALID_PASSWORD,
    });

    await expect(resetPasswordPage.errorAlert).toContainText(/invalid token/i);
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test('CT-09 - inserir código de recuperação expirado é recusado', async ({
    page,
    newUser,
  }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestRecovery(newUser.email);
    await expect(page).toHaveURL(/\/reset-password/);

    let realCode: string | null = null;
    await expect
      .poll(
        async () => {
          realCode = await getRecoveryCode(newUser.email);
          return realCode;
        },
        { timeout: 10_000 },
      )
      .toMatch(/^\d{6}$/);

    // Backdoor de teste: sem essa etapa não há como esperar 5 minutos reais
    // (ver support/db.ts) — o resto do fluxo é 100% pela UI.
    await expireRecoveryCode(newUser.email);

    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.resetPassword({
      token: realCode as unknown as string,
      newPassword: OTHER_VALID_PASSWORD,
    });

    await expect(resetPasswordPage.errorAlert).toContainText(/time limit/i);
  });

  test('CT-10 - alterar senha após recuperação bem-sucedida permite login com a nova senha', async ({
    page,
    newUser,
  }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestRecovery(newUser.email);
    await expect(page).toHaveURL(/\/reset-password/);

    let code: string | null = null;
    await expect
      .poll(
        async () => {
          code = await getRecoveryCode(newUser.email);
          return code;
        },
        { timeout: 10_000 },
      )
      .toMatch(/^\d{6}$/);

    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.resetPassword({
      token: code as unknown as string,
      newPassword: OTHER_VALID_PASSWORD,
    });

    await expect(page).toHaveURL(/\/login/);

    const loginPage = new LoginPage(page);
    await loginPage.login(newUser.email, OTHER_VALID_PASSWORD);
    await expect(page).toHaveURL(/\/analytics/);
  });
});
