import { CloudSun, TriangleAlert } from 'lucide-react';
import type { ClimateValidation } from '../models/History';
import { climateValidationMessage, climateValidationTitle } from '../lib/climate';
import { cn } from '../lib/utils';

interface ClimateValidationNoteProps {
  validation?: ClimateValidation;
  className?: string;
}

/**
 * Mostra se a doença diagnosticada pela IA é plausível para o clima recente
 * da região do usuário. Sem validação (localização negada ou clima
 * indisponível), informa que o diagnóstico não foi cruzado com o clima.
 */
export function ClimateValidationNote({ validation, className }: ClimateValidationNoteProps) {
  if (!validation) {
    return (
      <div
        data-testid="climate-validation"
        data-status="unverified"
        className={cn('rounded-md border p-3 text-sm text-muted-foreground', className)}
      >
        <p className="flex items-center gap-2 font-medium">
          <CloudSun className="h-4 w-4 flex-shrink-0" />
          Clima da região não verificado
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          Permita o acesso à localização para validarmos se esta doença é compatível com o clima
          da sua região.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="climate-validation"
      data-status={validation.compatible ? 'compatible' : 'incompatible'}
      role={validation.compatible ? undefined : 'alert'}
      className={cn(
        'rounded-md border p-3 text-sm',
        validation.compatible
          ? 'border-primaryGreen/40 bg-primaryGreen/10'
          : 'border-warning/50 bg-warning/10',
        className,
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 font-medium',
          validation.compatible ? 'text-primaryGreen' : 'text-warning',
        )}
      >
        {validation.compatible ? (
          <CloudSun className="h-4 w-4 flex-shrink-0" />
        ) : (
          <TriangleAlert className="h-4 w-4 flex-shrink-0" />
        )}
        {climateValidationTitle(validation)}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {climateValidationMessage(validation)}
      </p>
    </div>
  );
}
