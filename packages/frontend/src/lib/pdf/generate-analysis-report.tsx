import { format } from "date-fns";
import type { History } from "../../models/History";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateAnalysisReportPdf(analysis: History): Promise<void> {
  const [{ pdf }, { AnalysisReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./analysis-report-document"),
  ]);

  const blob = await pdf(
    <AnalysisReportDocument analysis={analysis} />
  ).toBlob();

  const fileName = `relatorio-analise-${slugify(
    analysis.crop || "agroscope"
  )}-${format(new Date(analysis.createdAt), "yyyy-MM-dd")}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
