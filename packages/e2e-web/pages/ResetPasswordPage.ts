import type { Page, Locator } from '@playwright/test';

export class ResetPasswordPage {
  readonly page: Page;
  readonly tokenInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tokenInput = page.locator('#token');
    this.newPasswordInput = page.locator('#newPassword');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.getByRole('button', { name: /Redefinir senha|Redefinindo/ });
    // Next.js injeta seu próprio elemento com role="alert" (route announcer,
    // sempre vazio) para acessibilidade de navegação — filtra por texto para
    // pegar só o alerta de erro real do formulário.
    this.errorAlert = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto(email: string): Promise<void> {
    await this.page.goto(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  async resetPassword(params: {
    token: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.tokenInput.fill(params.token);
    await this.newPasswordInput.fill(params.newPassword);
    await this.confirmPasswordInput.fill(params.confirmPassword ?? params.newPassword);
    await this.submitButton.click();
  }
}
