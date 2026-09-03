import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="border-t border-border/20 py-8 px-4 md:px-6 bg-[#19241b]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#f4fff4]">
            AgroScope - Tecnologia para o Agronegócio
          </p>
          <div className="flex items-center gap-4 text-sm text-[#f4fff4]">
            <Link
              href="/termos"
              className="hover:text-gray-400 cursor-pointer transition-colors"
            >
              Termos
            </Link>
            <span className="hover:text-gray-400  cursor-pointer transition-colors">
              Privacidade
            </span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">
              Contato
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
