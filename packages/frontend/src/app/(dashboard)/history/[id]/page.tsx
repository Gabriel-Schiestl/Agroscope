"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  ArrowLeft,
  CalendarIcon,
  FileText,
  MessageCircle,
} from "lucide-react";
import type { History } from "../../../../models/History";
import { ChatPanel } from "../../../../components/chat-panel";
import { DiagnosisResult } from "../../../../components/diagnosis-result";
import { useHistory } from "../../../../hooks/use-history";
import { useLimit } from "../../../../hooks/use-limit";
import { toImageSrc } from "../../../../lib/utils";
import { generateAnalysisReportPdf } from "../../../../lib/pdf/generate-analysis-report";
import {
  hasPlanFeature,
  PLAN_FEATURE_REPORT_GENERATION,
} from "../../../../lib/plan-features";
import { toast } from "react-toastify";

export default function HistoryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { history: historyEntries, isLoading } = useHistory();
  const [history, setHistory] = useState<History | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { limit } = useLimit();
  const canGenerateReport = hasPlanFeature(
    limit?.featureFlags,
    PLAN_FEATURE_REPORT_GENERATION
  );

  useEffect(() => {
    if (isLoading) return;
    const found = historyEntries.find((entry) => entry.id === params.id);
    if (!found) {
      notFound();
      return;
    }
    setHistory(found);
  }, [historyEntries, isLoading, params.id]);

  const handleGenerateReport = async () => {
    if (!history) return;
    if (!canGenerateReport) {
      toast.error(
        "Relatórios em PDF disponíveis apenas nos planos pagos. Faça upgrade do seu plano."
      );
      return;
    }
    setIsGeneratingReport(true);
    try {
      await generateAnalysisReportPdf(history);
    } catch (error) {
      toast.error("Não foi possível gerar o relatório em PDF.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || !history) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Carregando dados da análise...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/analytics?tab=history">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl">Detalhes da Análise</h1>
            <div className="flex items-center text-mediumGray">
              <CalendarIcon className="mr-1" size={16} />
              {format(
                new Date(history.createdAt),
                "dd 'de' MMMM 'de' yyyy, HH:mm",
                { locale: ptBR }
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-primaryGreen border-primaryGreen/30"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Perguntar à Íris
          </Button>
          <Button
            className="bg-primaryGreen hover:bg-lightGreen"
            disabled={isGeneratingReport || !canGenerateReport}
            onClick={handleGenerateReport}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingReport ? "Gerando..." : "Relatório PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`relative w-full h-64 rounded-md overflow-hidden bg-muted ring-2 ring-offset-2 ring-offset-background ${
                history.sicknessId ? "ring-warning/60" : "ring-primaryGreen/60"
              }`}
            >
              <Image
                src={toImageSrc(history.image)}
                alt={history.crop || "Análise"}
                fill
                className="object-cover"
              />
            </div>

            <DiagnosisResult
              crop={history.crop}
              cropConfidence={history.cropConfidence}
              sicknessId={history.sicknessId}
              sicknessName={history.sicknessName}
              sicknessConfidence={history.sicknessConfidence}
              explanation={history.explanation}
              causes={history.causes}
              handling={history.handling}
              precautions={history.precautions}
            />
          </div>
        </CardContent>
      </Card>

      {!canGenerateReport && (
        <p className="text-xs text-red-500 text-center">
          Relatórios em PDF disponíveis nos planos pagos. Faça upgrade do seu
          plano para gerar relatórios.
        </p>
      )}

      <ChatPanel
        open={chatOpen}
        analysis={history}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
