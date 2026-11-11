import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import Footer from '../components/footer';
import { SupportedCrops } from '../components/supported-crops';

export const metadata: Metadata = {
  title: 'Ajuda | AgroScope',
  description:
    'Dúvidas frequentes sobre o AgroScope: como tirar a foto, culturas atendidas, limites e planos.',
};

const FAQ = [
  {
    q: 'Como faço uma análise?',
    a: 'Entre na sua conta e abra a aba "Nova Análise". Selecione a cultura, clique em "Selecionar Imagem" (no aplicativo, "Galeria" ou "Câmera") e depois em "Analisar Imagem". O resultado aparece em "Resultado da Análise".',
  },
  {
    q: 'Como tirar uma boa foto?',
    a: 'Fotografe uma única folha, de perto, com boa iluminação e sem tremer. Mostre os sintomas (manchas, lesões ou descoloração). Se a foto não for de uma folha ou estiver com pouca qualidade, o AgroScope pede para tirar outra.',
  },
  {
    q: 'Quais formatos e tamanhos de imagem são aceitos?',
    a: 'Fotos em JPG, PNG ou WEBP de até 5 MB.',
  },
  {
    q: 'O que significa a porcentagem de confiança?',
    a: 'É o quanto a IA tem certeza do diagnóstico. Abaixo de 80%, o AgroScope não mostra o diagnóstico e pede uma nova foto, para evitar uma orientação errada.',
  },
  {
    q: 'Por que o AgroScope pede minha localização?',
    a: 'Ela é opcional. Com a localização liberada, o diagnóstico é comparado com o clima dos últimos 7 dias da sua região para indicar se a doença é provável naquelas condições.',
  },
  {
    q: 'Quantas análises posso fazer?',
    a: 'O plano Gratuito permite 10 análises de imagem e 50 mensagens à Íris por mês. Os planos PRO e PREMIUM aumentam esses limites e liberam o relatório em PDF de cada análise. Os limites são renovados todo dia 1º.',
  },
  {
    q: 'Onde vejo as análises anteriores?',
    a: 'Na aba "Histórico", com busca e filtros por cultura e data. A aba "Estatísticas" mostra as doenças e culturas mais analisadas.',
  },
  {
    q: 'O diagnóstico substitui um agrônomo?',
    a: 'Não. O AgroScope oferece uma orientação inicial. Consulte um agrônomo para confirmar o diagnóstico e definir o tratamento.',
  },
];

export default function AjudaPage() {
  return (
    <div className="flex flex-col min-h-full pt-16 pb-16 md:pb-0 bg-gradient-to-r from-[#3c493b] via-[#253528] to-[#19601f]">
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-[#f4fff4] mb-4 text-center">
            Central de <span className="text-[#43a547]">Ajuda</span>
          </h1>
          <p className="text-center text-[#a2a8a2] mb-10">
            Respostas para as dúvidas mais comuns sobre o AgroScope.
          </p>

          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-primary/20 bg-[#09200b]/70 p-5 open:bg-[#09200b]"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium text-[#f4fff4]">
                  {q}
                  <span className="text-[#4dae50] transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#a2a8a2] leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#09200b]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Culturas e doenças reconhecidas
          </h2>
          <SupportedCrops />
        </div>
      </section>

      <section id="contato" className="py-12 px-4">
        <div className="max-w-[700px] mx-auto text-center rounded-2xl border border-primary/20 bg-[#09200b]/70 p-8">
          <Mail className="mx-auto mb-3 text-[#4dae50]" size={28} />
          <h2 className="text-xl font-bold text-[#f4fff4] mb-2">
            Ainda com dúvidas?
          </h2>
          <p className="text-sm text-[#a2a8a2]">
            Escreva para{' '}
            <a
              href="mailto:privacidade@agroscope.com"
              className="text-[#4dae50] hover:underline"
            >
              privacidade@agroscope.com
            </a>
            . Para saber como tratamos seus dados, leia os{' '}
            <Link href="/termos" className="text-[#4dae50] hover:underline">
              Termos de Uso e Privacidade
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
