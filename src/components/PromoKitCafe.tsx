import React from 'react';
import { ArrowRight, Coffee, Gift } from 'lucide-react';

const KIT_IMAGE = 'https://horecaprofesional.com.co/wp-content/uploads/2026/11/creation_3824670673.png';
export const PROMO_MIN_BARISTICO = 4000000;

interface Props {
  /** Lleva al cliente a los productos del catálogo. Sin esta función se muestra la versión compacta (pop up). */
  onShopNow?: () => void;
}

/**
 * Promoción en Mundo Barístico:
 * kit de accesorios de café gratis por compras iguales o superiores a $4.000.000 en productos Barístico.
 */
export default function PromoKitCafe({ onShopNow }: Props) {
  const banner = Boolean(onShopNow);
  return (
    <section
      aria-label="Promoción kit de accesorios de café gratis"
      className={`relative overflow-hidden ${banner ? 'rounded-3xl' : 'rounded-2xl'} text-[#f4f1e4] shadow-xl shadow-[#3b2c23]/25 ring-1 ring-[#8b5e3c]/30 bg-[radial-gradient(120%_130%_at_100%_0%,#a77548_0%,#5b4638_45%,#24170f_100%)]`}
    >
      {/* Brillo y granos de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-10 w-72 h-72 rounded-full bg-[#f4f1e4]/15 blur-3xl" />
      <Coffee aria-hidden="true" className="pointer-events-none absolute left-4 bottom-3 w-20 h-20 text-white/[0.06]" />

      <div className={`relative grid grid-cols-[1fr_auto] items-center ${banner ? 'gap-4 sm:gap-8 p-5 sm:p-8' : 'gap-3 p-5 pb-4'}`}>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/12 ring-1 ring-white/25 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em]">
            <Gift className="w-3.5 h-3.5" />
            Promo Barístico
          </span>

          <h3 className={`mt-3 text-[22px] ${banner ? 'sm:text-[32px]' : 'sm:text-2xl'} font-black leading-[1.08] tracking-tight [text-wrap:balance] text-white`}>
            Llévate un kit de accesorios de café{' '}
            <span className="inline-block -rotate-2 rounded-md bg-[#f4f1e4] px-1.5 text-[#5b4638]">GRATIS</span>
          </h3>

          <p className={`mt-2.5 text-xs ${banner ? 'sm:text-[15px]' : 'sm:text-[13px]'} leading-relaxed text-[#f4f1e4]/85 max-w-xl`}>
            Por compras <strong className="text-white">iguales o superiores a $4.000.000</strong> en cafeteras y molinos{' '}
            <strong className="text-white">Barístico</strong>.
          </p>

          {banner && (
          <button
            type="button"
            onClick={onShopNow}
            className="mt-4 sm:mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#f4f1e4] hover:bg-white text-[#5b4638] font-bold text-xs sm:text-sm px-4 py-2.5 sm:px-5 sm:py-3 shadow-md transition-all active:scale-[0.98]"
          >
            Ver cafeteras y molinos <ArrowRight className="w-4 h-4" />
          </button>
          )}
        </div>

        {/* Regalo */}
        <div className={`relative shrink-0 rotate-3 ${banner ? 'w-28 h-28 sm:w-52 sm:h-52' : 'w-24 h-24 sm:w-36 sm:h-36'}`}>
          <div aria-hidden="true" className="absolute -inset-4 rounded-full bg-[#f4f1e4]/25 blur-2xl" />
          <img
            src={KIT_IMAGE}
            alt="Kit de accesorios de café de regalo"
            className="relative w-full h-full object-contain rounded-2xl bg-white p-2 ring-4 ring-white/25 shadow-[0_14px_30px_rgba(0,0,0,0.4)]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <span className="absolute -top-1 -left-2 -rotate-12 rounded-full bg-amber-400 text-[#3b2c23] text-[10px] sm:text-xs font-black uppercase px-2 py-1 shadow-md">
            $0
          </span>
        </div>
      </div>
    </section>
  );
}
