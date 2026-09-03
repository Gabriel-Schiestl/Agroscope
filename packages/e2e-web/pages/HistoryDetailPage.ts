import type { Page, Locator } from '@playwright/test';

export class HistoryDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly diagnosisHeading: Locator;
  readonly cropHeading: Locator;
  readonly chatButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'Detalhes da Análise' });
    this.diagnosisHeading = page.getByRole('heading', { name: 'Diagnóstico' });
    this.cropHeading = page.getByRole('heading', { name: 'Cultura' });
    this.chatButton = page.getByRole('button', { name: 'Chat' });
  }

  async goto(historyId: string): Promise<void> {
    await this.page.goto(`/history/${historyId}`);
  }
}
