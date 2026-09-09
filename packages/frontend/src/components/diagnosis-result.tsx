import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cropLabel, sicknessLabel } from "../lib/agro-labels";
import { ConfidenceMeter } from "./confidence-meter";
import { cn } from "../lib/utils";

export interface DiagnosisResultProps {
  crop: string;
  cropConfidence: number;
  sicknessId?: string;
  sicknessName?: string;
  sicknessConfidence?: number;
  explanation?: string;
  causes?: string;
  handling?: string;
  precautions?: string;
  className?: string;
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </h3>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export function DiagnosisResult({
  crop,
  cropConfidence,
  sicknessId,
  sicknessName,
  sicknessConfidence,
  explanation,
  causes,
  handling,
  precautions,
  className,
}: DiagnosisResultProps) {
  const isHealthy = !sicknessId;
  const headline = isHealthy
    ? "Planta Saudável"
    : sicknessName
    ? sicknessLabel(sicknessName)
    : "Doença identificada";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Headline */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isHealthy ? (
            <CheckCircle2 className="h-7 w-7 text-primaryGreen mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-7 w-7 text-warning mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h2 data-testid="diagnosis-headline" className="text-2xl font-bold leading-tight">{headline}</h2>
            <p data-testid="diagnosis-crop" className="text-sm text-muted-foreground mt-0.5">
              {cropLabel(crop)}
              {cropConfidence > 0 && ` · ${(cropConfidence * 100).toFixed(1)}% confiança na cultura`}
            </p>
          </div>
        </div>
        {!isHealthy && sicknessConfidence != null && sicknessConfidence > 0 && (
          <ConfidenceMeter value={sicknessConfidence} className="flex-shrink-0" />
        )}
      </div>

      {/* Content sections, ordered by the question they answer */}
      <div className="space-y-4">
        {explanation && <Section label="O que foi identificado" text={explanation} />}
        {causes && <Section label="Por que a IA acredita nisso" text={causes} />}
        {handling && <Section label="O que fazer agora" text={handling} />}
        {precautions && <Section label="Precauções" text={precautions} />}
      </div>
    </div>
  );
}
