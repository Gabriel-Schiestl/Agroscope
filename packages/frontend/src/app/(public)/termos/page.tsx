import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { VoltarButton } from "./voltar-button";

export const metadata = {
  title: "Termos de Uso e Consentimento LGPD | AgroScope",
};

export default function TermosPage() {
  return (
    <div className="flex min-h-screen justify-center p-4 bg-lightGray">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <h2 className="text-primaryGreen font-bold text-2xl">AgroScope</h2>
          </div>
          <CardTitle className="text-2xl text-center">
            Termos de Uso e Consentimento para Tratamento de Dados (LGPD)
          </CardTitle>
          <CardDescription className="text-center">
            Última atualização: 01 de agosto de 2026
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-relaxed text-darkGray">
          <p className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            Este texto descreve, em linguagem acessível, como o AgroScope
            trata os dados pessoais e as imagens enviadas por seus usuários,
            em conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018 — LGPD). Este é um modelo de referência e deve ser
            revisado pelo setor jurídico responsável antes de sua utilização
            definitiva em produção.
          </p>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              1. Controlador dos dados
            </h3>
            <p>
              O AgroScope (&quot;nós&quot;, &quot;nosso sistema&quot;) é o controlador dos dados
              pessoais tratados por meio da plataforma, nos termos do art. 5º,
              VI, da LGPD, sendo responsável pelas decisões referentes ao
              tratamento dos dados pessoais dos usuários.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              2. Dados coletados
            </h3>
            <p>Para prestar o serviço, coletamos e armazenamos:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Dados de cadastro: nome, e-mail e senha (armazenada de forma
                criptografada).
              </li>
              <li>
                Imagens de plantas enviadas por você para análise e
                diagnóstico de doenças, incluindo os metadados associados a
                cada envio (data, resultado da análise, histórico).
              </li>
              <li>
                Dados de uso da plataforma, necessários para o funcionamento
                dos planos, limites de uso e histórico de análises.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              3. Finalidade do tratamento
            </h3>
            <p>Os dados e imagens informados acima são utilizados para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criar e autenticar sua conta na plataforma.</li>
              <li>
                Processar as imagens enviadas em nosso serviço de inteligência
                artificial, com a finalidade exclusiva de identificar doenças
                e gerar o diagnóstico solicitado por você.
              </li>
              <li>
                Manter um histórico das análises realizadas, para que você
                possa consultá-las posteriormente.
              </li>
              <li>
                Cumprir obrigações legais e regulatórias, quando aplicável.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              4. Compartilhamento de dados
            </h3>
            <p>
              As imagens enviadas são compartilhadas apenas com o serviço
              interno de inteligência artificial do próprio AgroScope,
              responsável por processar o diagnóstico. Não vendemos,
              alugamos ou compartilhamos seus dados pessoais ou imagens com
              terceiros para fins comerciais ou publicitários.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              5. Base legal
            </h3>
            <p>
              O tratamento dos seus dados pessoais e das imagens enviadas é
              realizado com fundamento na execução do contrato de prestação
              de serviço (art. 7º, V, da LGPD) e no seu consentimento livre,
              informado e inequívoco (art. 7º, I, da LGPD), manifestado no
              momento da criação da sua conta.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              6. Retenção e exclusão dos dados
            </h3>
            <p>
              Seus dados e imagens são mantidos enquanto sua conta estiver
              ativa ou pelo tempo necessário para cumprir as finalidades
              descritas neste termo. Você pode solicitar a exclusão da sua
              conta e dos dados associados a qualquer momento, através dos
              canais de contato indicados abaixo.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              7. Seus direitos como titular dos dados
            </h3>
            <p>
              Nos termos do art. 18 da LGPD, você tem direito a, a qualquer
              momento e mediante requisição:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar seus dados;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>
                Solicitar a anonimização, bloqueio ou eliminação de dados
                desnecessários ou tratados em desconformidade com a LGPD;
              </li>
              <li>Solicitar a portabilidade dos seus dados;</li>
              <li>Eliminar os dados tratados com base no seu consentimento;</li>
              <li>
                Revogar o consentimento a qualquer momento, o que pode
                implicar a impossibilidade de continuar utilizando os
                serviços que dependem do uso das imagens enviadas.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              8. Segurança das informações
            </h3>
            <p>
              Adotamos medidas técnicas e administrativas para proteger seus
              dados pessoais e as imagens enviadas contra acessos não
              autorizados e situações acidentais ou ilícitas de destruição,
              perda, alteração, comunicação ou qualquer forma de tratamento
              inadequado ou ilícito.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              9. Contato
            </h3>
            <p>
              Em caso de dúvidas sobre este termo ou para exercer seus
              direitos como titular de dados, entre em contato com nosso
              encarregado de proteção de dados (DPO) pelo e-mail{" "}
              <span className="font-medium">privacidade@agroscope.com</span>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-darkGray">
              10. Aceite
            </h3>
            <p>
              Ao marcar a opção de aceite no momento da criação da sua conta,
              você declara ter lido e compreendido este termo e consente,
              de forma livre, informada e inequívoca, com o tratamento dos
              seus dados pessoais e das imagens enviadas para análise, nos
              termos aqui descritos.
            </p>
          </section>

          <div className="text-center pt-2">
            <VoltarButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
