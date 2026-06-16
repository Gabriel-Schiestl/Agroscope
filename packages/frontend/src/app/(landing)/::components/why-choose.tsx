import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { ArrowRight, Check, Leaf } from "lucide-react";

export default function WhyChoose() {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <>
      {/* SEÇÃO 3 - Como funciona */}
      <section className="py-12 px-4 ">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center text-[#f4fff4]">
            Por que escolher o{" "}
            <span className="text-[#43a547]">AgroScope?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group rounded-xl border border-primary/20 bg-[#09200b]/70 p-6 hover:bg-[#09200b] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <Leaf size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#f4fff4]">
                  Diagnóstico Preciso
                </h3>
                <p className="text-mediumGray">
                  Nossa IA foi treinada com milhares de imagens para identificar
                  com precisão mais de 50 doenças em plantas.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-xl border border-primary/20 bg-[#09200b]/70 p-6 hover:bg-[#09200b] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Recomendações Personalizadas
                </h3>
                <p className="text-mediumGray">
                  Receba orientações específicas para tratamento e prevenção
                  baseadas no diagnóstico da sua planta.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-xl border border-primary/20 bg-[#09200b]/70 p-6 hover:bg-[#09200b] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <ArrowRight size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Gestão Completa
                </h3>
                <p className="text-mediumGray">
                  Além do diagnóstico, nossa plataforma oferece ferramentas
                  completas para gestão agronômica.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* BOTÃO COMECE AGORA */}
          {/* <div className="mt-10 text-center">
            <Button
              className="bg-primaryGreen hover:bg-lightGreen"
              onClick={openSignup}
            >
              Comece Agora Gratuitamente
            </Button>
          </div> */}
        </div>
      </section>
    </>
  );
}
