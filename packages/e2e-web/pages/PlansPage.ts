import type { Page, Locator } from '@playwright/test';

export class PlansPage {
  readonly page: Page;
  readonly inUseBadge: Locator;
  readonly loadingMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Só o plano atual do usuário exibe esse badge/CTA — assert global é suficiente
    // e mais robusto do que tentar escopar por card via travessia de DOM.
    this.inUseBadge = page.getByText('Em uso').first();
    this.loadingMessage = page.getByText('Carregando planos...');
  }

  async goto(): Promise<void> {
    await this.page.goto('/plans');
  }

  planHeading(planType: string): Locator {
    // CardTitle (components/ui/card.tsx) renderiza uma <div>, não uma tag de
    // heading semântica — por isso texto, e não role="heading", aqui.
    return this.page.getByText(planType, { exact: true });
  }

  limitsText(imageLimit: number, chatLimit: number): { images: Locator; chat: Locator } {
    return {
      images: this.page.getByText(`Até ${imageLimit} diagnósticos de imagem por mês`),
      chat: this.page.getByText(`Até ${chatLimit} interações no chat por mês`),
    };
  }
}
