import { Leaf } from 'lucide-react';

// Culturas e classes reconhecidas pelos 5 modelos da IA (packages/IA/README.md).
// Cada modelo também reconhece a folha saudável: 15 classes no total, 10 doenças.
export const SUPPORTED_CROPS = [
  { crop: 'Café', diseases: ['Ferrugem do cafeeiro', 'Mancha de Phoma'] },
  { crop: 'Soja', diseases: ['Ferrugem asiática', 'Crestamento bacteriano'] },
  { crop: 'Tomate', diseases: ['Pinta bacteriana', 'Mofo das folhas'] },
  { crop: 'Trigo', diseases: ['Ferrugem parda', 'Ferrugem amarela'] },
  { crop: 'Milho', diseases: ['Ferrugem polissora', 'Ferrugem comum'] },
];

export function SupportedCrops() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {SUPPORTED_CROPS.map(({ crop, diseases }) => (
        <div
          key={crop}
          className="rounded-xl border border-primary/20 bg-[#09200b]/70 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={18} className="text-[#4dae50]" />
            <h3 className="font-semibold text-[#f4fff4]">{crop}</h3>
          </div>
          <ul className="space-y-1 text-sm text-[#a2a8a2]">
            {diseases.map((d) => (
              <li key={d}>{d}</li>
            ))}
            <li className="text-[#cae8cb]">Folha saudável</li>
          </ul>
        </div>
      ))}
    </div>
  );
}
