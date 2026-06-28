"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { ArrowRight, CheckCircle2, Upload, Zap } from "lucide-react";

export default function HowItWorks() {
  const { openSignup } = useAuthModal();

  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Envie a Imagem",
      desc: "Faça upload de uma foto da folha da sua planta usando a câmera ou galeria.",
    },
    {
      step: "02",
      icon: Zap,
      title: "Análise com IA",
      desc: "Nosso algoritmo processa e identifica possíveis doenças em segundos.",
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Receba Resultados",
      desc: "Obtenha diagnóstico detalhado com recomendações de tratamento.",
    },
  ];

  return (
    <div className="bg-[#09200b]" id="como-funciona">
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-14">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-[#cae8cb] mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>

                <p className="text-primary font-semibold mb-2">
                  Passo {item.step}
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>

                <p className="text-[#a2a8a2]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6">
        <div className="max-w-[800px] mx-auto text-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-10 md:p-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Comece agora gratuitamente
          </h2>

          <p className="text-[#a2a8a2] mb-6 max-w-md mx-auto">
            Junte-se a milhares de produtores que já utilizam o AgroScope para
            proteger suas lavouras.
          </p>

          <Button
            size="lg"
            onClick={openSignup}
            className="bg-[#4dae50] hover:bg-[#334f36] text-primary-foreground"
          >
            Criar Conta Grátis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
