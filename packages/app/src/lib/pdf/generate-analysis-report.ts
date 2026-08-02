import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { History } from '@/models/History';
import { imageToDataUri } from '@/lib/utils';

const COLORS = {
    primaryGreen: '#4CAF50',
    darkGreen: '#2E7D32',
    lightGreen: '#E8F5E9',
    lightGray: '#F0F4F8',
    mediumGray: '#8A8A8E',
    darkGray: '#424242',
    border: '#E5E7EB',
    white: '#FFFFFF',
};

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(COMBINING_DIACRITICS, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function formatGeneratedAt(date: Date): string {
    const datePart = date.toLocaleDateString('pt-BR');
    const timePart = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${datePart} às ${timePart}`;
}

function formatAnalyzedAt(date: Date): string {
    const datePart = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function sectionHtml(title: string, text?: string): string {
    if (!text) return '';
    return `
        <div class="section">
            <div class="section-title">${escapeHtml(title)}</div>
            <div class="section-text">${escapeHtml(text)}</div>
        </div>
    `;
}

function buildReportHtml(analysis: History): string {
    const generatedAt = formatGeneratedAt(new Date());
    const analyzedAt = formatAnalyzedAt(new Date(analysis.createdAt));
    const isHealthy = !analysis.sicknessId;
    const imageSrc = imageToDataUri(analysis.image);
    const reportNumber = analysis.id.slice(0, 8).toUpperCase();

    const imageBlock = imageSrc
        ? `<div class="image-wrapper"><img src="${imageSrc}" /></div>`
        : `<div class="image-placeholder">Imagem não disponível</div>`;

    const cropConfidenceBadge =
        analysis.cropConfidence != null
            ? `<span class="badge">${analysis.cropConfidence.toFixed(1)}% confiança</span>`
            : '';

    const diagnosisText = isHealthy
        ? 'Nenhuma doença identificada'
        : escapeHtml(analysis.explanation || 'Não identificado');

    const sicknessConfidenceBadge =
        !isHealthy && analysis.sicknessConfidence != null
            ? `<span class="badge-outline">${analysis.sicknessConfidence.toFixed(1)}% confiança</span>`
            : '';

    const handlingBlock = analysis.handling
        ? `
            <div class="section">
                <div class="section-title">Recomendações de Manejo</div>
                <div class="highlight-box">${escapeHtml(analysis.handling)}</div>
            </div>
        `
        : '';

    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <style>
            * { box-sizing: border-box; }
            body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: ${COLORS.darkGray}; margin: 0; padding: 0; }
            .header { background-color: ${COLORS.primaryGreen}; padding: 22px 40px; display: flex; justify-content: space-between; align-items: flex-start; color: ${COLORS.white}; }
            .brand { font-size: 20px; font-weight: bold; }
            .brand-sub { font-size: 8.5px; color: ${COLORS.lightGreen}; margin-top: 2px; }
            .header-right { text-align: right; }
            .report-title { font-size: 12px; font-weight: bold; }
            .report-date { font-size: 8px; color: ${COLORS.lightGreen}; margin-top: 3px; }
            .body { padding: 20px 40px 56px; }
            .meta-row { display: flex; background-color: ${COLORS.lightGray}; border-radius: 4px; padding: 12px; margin-bottom: 16px; }
            .meta-item { flex: 1; }
            .meta-label { font-size: 7.5px; color: ${COLORS.mediumGray}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
            .meta-value { font-size: 9.5px; font-weight: bold; color: ${COLORS.darkGray}; }
            .top-section { display: flex; gap: 16px; margin-bottom: 16px; }
            .image-wrapper, .image-placeholder { width: 170px; height: 170px; border-radius: 4px; border: 1px solid ${COLORS.border}; flex-shrink: 0; overflow: hidden; }
            .image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
            .image-placeholder { background-color: ${COLORS.lightGray}; display: flex; align-items: center; justify-content: center; font-size: 8px; color: ${COLORS.mediumGray}; text-align: center; }
            .summary-col { flex: 1; display: flex; flex-direction: column; gap: 10px; }
            .summary-block { border-bottom: 1px solid ${COLORS.border}; padding-bottom: 8px; }
            .summary-block:last-child { border-bottom: none; padding-bottom: 0; }
            .summary-label { font-size: 9px; font-weight: bold; color: ${COLORS.darkGray}; margin-bottom: 4px; }
            .summary-value-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
            .summary-value { font-size: 12px; font-weight: bold; color: ${COLORS.darkGreen}; }
            .badge { background-color: ${COLORS.primaryGreen}; border-radius: 8px; padding: 2px 7px; font-size: 7.5px; color: ${COLORS.white}; font-weight: bold; }
            .badge-outline { border: 1px solid ${COLORS.primaryGreen}; border-radius: 8px; padding: 2px 7px; font-size: 7.5px; color: ${COLORS.darkGreen}; font-weight: bold; }
            .section { margin-bottom: 14px; }
            .section-title { font-size: 10.5px; font-weight: bold; color: ${COLORS.darkGray}; margin-bottom: 5px; padding-left: 8px; border-left: 3px solid ${COLORS.primaryGreen}; }
            .section-text { font-size: 9.5px; line-height: 1.5; white-space: pre-wrap; }
            .highlight-box { background-color: ${COLORS.lightGreen}; border-radius: 4px; padding: 12px; border: 1px solid ${COLORS.primaryGreen}55; font-size: 9.5px; line-height: 1.5; white-space: pre-wrap; }
            .disclaimer { margin-top: 6px; padding: 10px; border-radius: 4px; background-color: ${COLORS.lightGray}; font-size: 8px; line-height: 1.4; color: ${COLORS.mediumGray}; font-style: italic; }
            .footer { padding: 14px 40px; border-top: 1px solid ${COLORS.border}; display: flex; justify-content: space-between; font-size: 7.5px; color: ${COLORS.mediumGray}; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="brand">AgroScope</div>
                <div class="brand-sub">Diagnóstico inteligente de doenças em plantas</div>
            </div>
            <div class="header-right">
                <div class="report-title">Relatório de Análise Fitossanitária</div>
                <div class="report-date">Gerado em ${generatedAt}</div>
            </div>
        </div>
        <div class="body">
            <div class="meta-row">
                <div class="meta-item">
                    <div class="meta-label">Data da análise</div>
                    <div class="meta-value">${analyzedAt}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Nº do relatório</div>
                    <div class="meta-value">${reportNumber}</div>
                </div>
            </div>
            <div class="top-section">
                ${imageBlock}
                <div class="summary-col">
                    <div class="summary-block">
                        <div class="summary-label">Cultura Identificada</div>
                        <div class="summary-value-row">
                            <span class="summary-value">${escapeHtml(analysis.crop || 'Não identificada')}</span>
                            ${cropConfidenceBadge}
                        </div>
                    </div>
                    <div class="summary-block">
                        <div class="summary-label">Diagnóstico</div>
                        <div class="summary-value-row">
                            <span class="summary-value">${diagnosisText}</span>
                            ${sicknessConfidenceBadge}
                        </div>
                    </div>
                </div>
            </div>
            ${sectionHtml('Causas / Sintomas', analysis.causes)}
            ${handlingBlock}
            ${sectionHtml('Precauções', analysis.precautions)}
            <div class="disclaimer">
                Este relatório foi gerado automaticamente por inteligência artificial e tem caráter meramente informativo. Consulte um agrônomo para confirmar o diagnóstico e obter recomendações específicas para a sua lavoura.
            </div>
        </div>
        <div class="footer">
            <span>AgroScope • Relatório gerado automaticamente</span>
        </div>
    </body>
    </html>
    `;
}

export async function generateAnalysisReportPdf(analysis: History): Promise<void> {
    const html = buildReportHtml(analysis);
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const fileName = `relatorio-analise-${slugify(
        analysis.crop || 'agroscope',
    )}-${new Date(analysis.createdAt).toISOString().slice(0, 10)}.pdf`;
    const destination = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.deleteAsync(destination, { idempotent: true }).catch(() => {});
    await FileSystem.copyAsync({ from: uri, to: destination });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(destination, {
            mimeType: 'application/pdf',
            dialogTitle: 'Relatório de Análise',
            UTI: 'com.adobe.pdf',
        });
    }
}
