import Link from "next/link";

const LINKS = [
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/ajuda", label: "Ajuda" },
  { href: "/termos", label: "Termos e Privacidade" },
  { href: "/ajuda#contato", label: "Contato" },
];

export default function Footer() {
  return (
    <>
      <footer className="border-t border-border/20 py-8 px-4 md:px-6 bg-[#19241b]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#f4fff4]">
            AgroScope - Diagnóstico de doenças em plantas com IA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#f4fff4]">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-gray-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
