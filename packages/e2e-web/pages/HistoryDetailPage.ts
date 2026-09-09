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
    // DiagnosisResult (components/diagnosis-result.tsx): o <h2> do
    // diagnóstico não é único na página (o logotipo "AgroScope" no
    // header/sidebar também é um <h2>), por isso usa data-testid; cultura
    // virou texto simples ao lado dele.
    this.diagnosisHeading = page.getByTestId('diagnosis-headline');
    this.cropHeading = page.getByTestId('diagnosis-crop');
    this.chatButton = page.getByRole('button', { name: 'Perguntar à Íris' });
  }

  async goto(historyId: string): Promise<void> {
    await this.page.goto(`/history/${historyId}`);
  }
}
