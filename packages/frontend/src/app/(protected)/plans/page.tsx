"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAuth } from "../../../contexts/auth-context";
import { Plan } from "../../../models/Plan";
import GetAllPlansAPI from "../../../../api/plan/GetAllPlans";
import ChangePlanAPI from "../../../../api/user/ChangePlan";

function formatPrice(price: number) {
  if (price === 0) return "Gratuito";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function PlansPage() {
  const { auth, refreshAuth } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await GetAllPlansAPI();

      if (response) {
        setPlans([...response].sort((a, b) => a.price - b.price));
      }

      setIsLoading(false);
    };

    fetchPlans();
  }, []);

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    const success = await ChangePlanAPI({ planId: selectedPlan.id });
    setIsSubmitting(false);

    if (success) {
      toast.success(`Plano ${selectedPlan.type} contratado com sucesso!`);
      setSelectedPlan(null);
      await refreshAuth();
    } else {
      toast.error("Não foi possível contratar o plano. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Planos</h1>
        <p className="text-mediumGray">
          Escolha o plano ideal para o seu negócio
        </p>
      </div>

      {isLoading ? (
        <p className="text-mediumGray">Carregando planos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === auth?.planId;

            return (
              <Card
                key={plan.id}
                className={
                  isCurrentPlan ? "border-primaryGreen shadow-md" : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.type}</CardTitle>
                    {isCurrentPlan && (
                      <Badge className="bg-primaryGreen text-white border-transparent shrink-0">
                        Em uso
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-mediumGray">/mês</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primaryGreen shrink-0" />
                      Até {plan.imageLimit} diagnósticos de imagem por mês
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primaryGreen shrink-0" />
                      Até {plan.chatLimit} interações no chat por mês
                    </li>
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primaryGreen shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Em uso
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      Contratar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selectedPlan}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar contratação</DialogTitle>
            <DialogDescription>
              Deseja contratar o plano {selectedPlan?.type}
              {selectedPlan
                ? ` por ${formatPrice(selectedPlan.price)}${
                    selectedPlan.price > 0 ? "/mês" : ""
                  }`
                : ""}
              ? Futuramente você poderá escolher a forma de cobrança.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPlan(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmPlan} disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
