"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ArrowLeft,
  CalendarIcon,
  Download,
  FileText,
  MessageCircle,
} from "lucide-react";
import type { History } from "../../../../models/History";
import { ChatPanel } from "../../../../components/chat-panel";
import { useHistory } from "../../../../hooks/use-history";
import { useLimit } from "../../../../hooks/use-limit";
import { toImageSrc } from "../../../../lib/utils";
import { cropLabel, sicknessLabel } from "../../../../lib/agro-labels";
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
          <Link href="/history">
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
            Chat
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
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
            <div className="relative w-full h-64 rounded-md overflow-hidden bg-muted">
              <Image
                src={toImageSrc(history.image)}
                alt={history.crop || "Análise"}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Cultura Identificada
                </h3>
                <p className="font-medium text-lg text-primaryGreen">
                  {cropLabel(history.crop)}
                  {history.cropConfidence != null && (
                    <Badge className="ml-2 bg-primaryGreen">
                      {(history.cropConfidence * 100).toFixed(1)}% confiança
                    </Badge>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Diagnóstico
                </h3>
                {!history.sicknessId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-primaryGreen text-white text-base px-3 py-1">
                      Planta Saudável
                    </Badge>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-lg">
                      {history.sicknessName
                        ? sicknessLabel(history.sicknessName)
                        : "Doença identificada"}
                    </p>
                    {history.sicknessConfidence != null && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-primaryGreen">
                          {(history.sicknessConfidence * 100).toFixed(1)}% confiança
                        </Badge>
                      </div>
                    )}
                    {history.explanation && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {history.explanation}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(history.causes || history.handling || history.precautions) && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.causes && (
              <div>
                <h3 className="font-medium">Causas / Sintomas</h3>
                <p className="text-muted-foreground mt-1">{history.causes}</p>
              </div>
            )}

            {history.handling && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium">Recomendações de Manejo</h3>
                  <p className="text-muted-foreground mt-1">
                    {history.handling}
                  </p>
                </div>
              </>
            )}

            {history.precautions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium">Precauções</h3>
                  <p className="text-muted-foreground mt-1">
                    {history.precautions}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

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
