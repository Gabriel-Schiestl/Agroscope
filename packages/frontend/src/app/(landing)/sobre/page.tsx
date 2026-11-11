import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Camera,
  CloudSun,
  FileText,
  History,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import Footer from '../components/footer';
import { SupportedCrops } from '../components/supported-crops';

export const metadata: Metadata = {
  title: 'Sobre Nós | AgroScope',
  description:
    'Conheça o AgroScope: diagnóstico de doenças em folhas por foto, com inteligência artificial, para o pequeno produtor rural.',
};

const FEATURES = [
  {
    icon: Camera,
    title: 'Diagnóstico por foto',
    desc: 'O produtor escolhe a cultura, envia a foto de uma folha e recebe o diagnóstico com o grau de confiança da IA.',
  },
  {
    icon: ShieldCheck,
    title: 'Triagem da imagem',
    desc: 'Antes do diagnóstico, a IA confere se a foto é de uma folha e se tem qualidade suficiente. Caso contrário, orienta a tirar outra foto.',
  },
  {
    icon: CloudSun,
    title: 'Validação com o clima',
    desc: 'Com a localização liberada, o resultado é comparado com o clima dos últimos 7 dias da região para indicar se a doença é provável.',
  },
  {
    icon: MessageCircle,
    title: 'Assistente Íris',
    desc: 'Nos planos pagos, tire dúvidas sobre o diagnóstico, as causas e o manejo em uma conversa com a Íris, a assistente virtual do AgroScope.',
  },
  {
    icon: History,
    title: 'Histórico e estatísticas',
    desc: 'Todas as análises ficam salvas, com filtros por cultura e data e gráficos das doenças e culturas mais analisadas.',
  },
  {
    icon: FileText,
    title: 'Relatório em PDF',
    desc: 'Nos planos pagos, cada análise pode ser exportada em um relatório PDF para guardar ou compartilhar com o agrônomo.',
  },
];

export default function SobrePage() {
  return (
    <div className="flex flex-col min-h-full pt-16 pb-16 md:pb-0 bg-gradient-to-r from-[#3c493b] via-[#253528] to-[#19601f]">
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#f4fff4] mb-6">
            Sobre o <span className="text-[#43a547]">AgroScope</span>
          </h1>
          <p className="text-lg text-[#f4fff4] mb-4">
            O AgroScope nasceu para ajudar o pequeno produtor rural a
            identificar cedo as doenças que atacam as folhas da lavoura, usando
            apenas o celular.
          </p>
          <p className="text-[#a2a8a2]">
            Uma foto da folha é analisada por modelos de inteligência
            artificial treinados para cada cultura. Em segundos, o produtor
            recebe o diagnóstico, as possíveis causas e recomendações de manejo,
            o que ajuda a agir antes que a doença se espalhe. O resultado é uma
            orientação inicial e não substitui a avaliação de um agrônomo.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#09200b]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center mb-3">
            O que a IA reconhece hoje
          </h2>
          <p className="text-center text-[#a2a8a2] mb-8">
            5 culturas e 10 doenças, além da folha saudável.
          </p>
          <SupportedCrops />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-[#f4fff4] text-center mb-8">
            O que a plataforma oferece
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-primary/20 bg-[#09200b]/70 p-6"
              >
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#f4fff4]">
                  {title}
                </h3>
                <p className="text-sm text-[#a2a8a2] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#a2a8a2] mt-10">
            Disponível no navegador e no aplicativo para celular. Ficou com
            dúvida? Veja a{' '}
            <Link href="/ajuda" className="text-[#4dae50] hover:underline">
              Ajuda
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
