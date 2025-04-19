import Sidebar from "../../components/Sidebar";

export default function Company() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu lateral */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sobre Nós</h1>

        <p className="text-lg text-gray-700 mb-4">
          O <strong>AgroScope</strong> é uma plataforma tecnológica desenvolvida
          para auxiliar produtores rurais no diagnóstico de doenças em plantas
          de forma ágil e precisa.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">
          Nossa Missão
        </h2>
        <p className="text-gray-700">
          Facilitar o controle de doenças agrícolas, tornando a análise de
          imagens uma ferramenta acessível, rápida e confiável para produtores.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">
          Como Funciona?
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>Upload de Imagem:</strong> O usuário anexa uma foto da folha
            pelo frontend.
          </li>
          <li>
            <strong>Processamento Inteligente:</strong> A IA analisa a imagem e
            identifica padrões de doenças.
          </li>
          <li>
            <strong>Diagnóstico e Recomendações:</strong> O resultado é exibido
            na tela, junto com orientações para o manejo.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">
          Tecnologias Utilizadas
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>Frontend:</strong> React.js, Tailwind CSS
          </li>
          <li>
            <strong>Backend:</strong> Flask, Flask-CORS
          </li>
          <li>
            <strong>Inteligência Artificial:</strong> TensorFlow/Keras
          </li>
          <li>
            <strong>Processamento de Imagens:</strong> PIL (Python Imaging
            Library)
          </li>
        </ul>

        <p className="text-lg text-gray-700 mt-6">
          Atualmente, o AgroScope detecta{" "}
          <strong>ferrugem e cercosporiose do milho</strong>, com planos de
          expansão para outras culturas no futuro.
        </p>

        <p className="text-lg font-semibold text-primaryGreen mt-6">
          Junte-se a nós nessa revolução tecnológica no campo! 🌱
        </p>
      </div>
    </div>
  );
}
