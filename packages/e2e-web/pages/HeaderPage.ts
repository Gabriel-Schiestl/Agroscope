import type { Page, Locator } from '@playwright/test';

export class HeaderPage {
  readonly page: Page;
  readonly avatarButton: Locator;
  readonly logoutMenuItem: Locator;
  readonly plansLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Não depende da imagem do avatar carregar (ela vem de um placeholder
    // externo, https://placehold.co, que pode não estar acessível no
    // ambiente de teste) — o botão do menu do usuário é sempre o último
    // <button> do header (depois de "Planos" e do toggle de tema).
    this.avatarButton = page.locator('header button').last();
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Sair' });
    this.plansLink = page.getByRole('link', { name: 'Planos' });
  }

  async logout(): Promise<void> {
    await this.avatarButton.click();
    await this.logoutMenuItem.click();
  }

  async goToPlans(): Promise<void> {
    await this.plansLink.click();
  }
}
