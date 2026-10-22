import React from 'react';
import { Snowflake, Coffee, LucideIcon } from 'lucide-react';

type World = 'artiq' | 'baristico';

interface CategoryButton {
  id: string;
  label: string;
  icon: LucideIcon;
}

const WORLDS: Record<World, {
  isotipo: string;
  watermark: string;
  name: string;
  categories: CategoryButton[];
  section: string;
  tile: string;
  divider: string;
  idle: string;
  active: string;
  iconIdle: string;
}> = {
  artiq: {
    isotipo: 'https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-1.svg',
    watermark: 'https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-2.svg',
    name: 'Artiq',
    categories: [
      { id: 'granizadora', label: 'Granizadoras', icon: Snowflake },
      { id: 'hielo', label: 'Máquinas de Hielo', icon: Snowflake },
      { id: 'dispensador', label: 'Dispensadores', icon: Snowflake },
    ],
    section: 'bg-artiq-50 border-artiq-100',
    tile: 'bg-artiq-500 shadow-artiq-500/30',
    divider: 'bg-artiq-100',
    idle: 'bg-white text-artiq-700 border-artiq-100 hover:border-artiq-500 hover:shadow-md',
    active: 'bg-artiq-600 text-white border-artiq-600 shadow-lg shadow-artiq-600/25',
    iconIdle: 'bg-artiq-50 text-artiq-500',
  },
  baristico: {
    isotipo: 'https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.1.svg',
    watermark: 'https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg',
    name: 'Barístico',
    categories: [
      { id: 'cafe', label: 'Cafeteras Espresso', icon: Coffee },
      { id: 'molino', label: 'Molinos On-Demand', icon: Coffee },
    ],
    section: 'bg-[#f4f1e4] border-[#e8e0d4]',
    tile: 'bg-[#5b4638] shadow-[#5b4638]/30',
    divider: 'bg-[#dfd4c5]',
    idle: 'bg-white text-[#5b4638] border-[#e8e0d4] hover:border-[#8b5e3c] hover:shadow-md',
    active: 'bg-[#5b4638] text-[#f4f1e4] border-[#5b4638] shadow-lg shadow-[#5b4638]/25',
    iconIdle: 'bg-[#f4f1e4] text-[#8b5e3c]',
  },
};

interface Props {
  world: World;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

/**
 * Sección compacta bajo el banner en /#artiq y /#baristico:
 * solo el isotipo del mundo y los botones de sus categorías.
 */
export default function WorldCategoryBar({ world, selectedCategory, onSelectCategory }: Props) {
  const w = WORLDS[world];

  return (
    <section
      id={`categorias-${world}`}
      aria-label={`Categorías ${w.name}`}
      className={`relative overflow-hidden rounded-3xl border ${w.section} px-5 py-6 sm:px-8 sm:py-7`}
    >
      {/* Isotipo grande de fondo */}
      <img
        src={w.watermark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-10 -bottom-12 w-56 h-56 sm:w-72 sm:h-72 object-contain opacity-[0.07]"
        referrerPolicy="no-referrer"
      />

      <div className="relative flex flex-col md:flex-row items-center gap-5 md:gap-8">
        {/* Isotipo */}
        <div className={`shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-[1.4rem] sm:rounded-[1.75rem] ${w.tile} shadow-xl flex items-center justify-center`}>
          <img
            src={w.isotipo}
            alt={`Isotipo ${w.name}`}
            className="w-9 h-9 sm:w-14 sm:h-14 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className={`hidden md:block w-px self-stretch ${w.divider}`} aria-hidden="true" />

        {/* Botones de categorías */}
        <div
          className={`w-full grid gap-2.5 sm:gap-3 ${
            w.categories.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          }`}
        >
          {w.categories.map(({ id, label, icon: Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectCategory(isActive ? 'all' : id)}
                className={`group flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-2xl border px-2 py-3 sm:px-4 sm:py-3.5 text-center sm:text-left transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current ${
                  isActive ? w.active : w.idle
                }`}
              >
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors ${
                    isActive ? 'bg-white/15 text-current' : w.iconIdle
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-xs sm:text-[15px] font-bold leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
