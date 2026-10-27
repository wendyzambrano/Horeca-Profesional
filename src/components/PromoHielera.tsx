import React from 'react';
import { Gift, Check, Snowflake } from 'lucide-react';

const PROMO_IMAGE = 'https://artiq.com.co/wp-content/uploads/2025/12/maquina-hielo12kg.webp';
export const PROMO_MIN_ARTIQ = 4000000;

interface Props {
  /** Total cotizado en equipos Artiq (COP). */
  artiqTotal?: number;
  /** Sin la barra de avance (para el pop up). */
  compact?: boolean;
}

const formatCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

/**
 * Promoción en la pestaña de cotización:
 * "Regístrate y obtén 1 hielera de 12 kg gratis por compras superiores a $4.000.000 en el portafolio Artiq".
 */
export default function PromoHielera({ artiqTotal = 0, compact = false }: Props) {
  const qualifies = artiqTotal > PROMO_MIN_ARTIQ;
  const progress = Math.min(100, Math.round((artiqTotal / PROMO_MIN_ARTIQ) * 100));
  const missing = Math.max(0, PROMO_MIN_ARTIQ - artiqTotal);

  return (
    <section
      aria-label="Promoción hielera gratis"
      className="relative overflow-hidden rounded-2xl text-white shadow-xl shadow-artiq-700/25 ring-1 ring-artiq-500/30 bg-[radial-gradient(120%_120%_at_100%_0%,#0da6d8_0%,#006074_45%,#002c36_100%)]"
    >
      {/* Brillo y copos de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
      <Snowflake aria-hidden="true" className="pointer-events-none absolute left-3 bottom-3 w-16 h-16 text-white/[0.07]" />
      <Snowflake aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2 w-6 h-6 text-white/10" />

      <div className="relative grid grid-cols-[1fr_auto] items-center gap-3 p-5 pb-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
            <Gift className="w-3.5 h-3.5" />
            Regístrate y gana
          </span>

          <h4 className="mt-3 text-[22px] sm:text-2xl font-black leading-[1.1] tracking-tight [text-wrap:balance]">
            Llévate una hielera de 12 kg{' '}
            <span className="inline-block -rotate-2 rounded-md bg-white px-1.5 text-artiq-700">GRATIS</span>
          </h4>

          <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-white/85">
            Por compras superiores a <strong className="text-white">$4.000.000</strong> en el portafolio{' '}
            <strong className="text-white">Artiq</strong>.
          </p>
        </div>

        {/* Producto de regalo */}
        <div className="relative shrink-0 w-24 h-24 sm:w-36 sm:h-36 rotate-3">
          <div aria-hidden="true" className="absolute -inset-3 rounded-full bg-artiq-100/30 blur-2xl" />
          <img
            src={PROMO_IMAGE}
            alt="Hielera de 12 kg de regalo"
            className="relative w-full h-full object-contain rounded-2xl bg-white p-2 ring-4 ring-white/25 shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <span className="absolute -top-1 -left-2 -rotate-12 rounded-full bg-amber-400 text-artiq-800 text-[10px] font-black uppercase px-2 py-1 shadow-md">
            $0
          </span>
        </div>
      </div>

      {!compact && (
        <>
      {/* Avance hacia el regalo */}
        <div className="relative bg-black/20 backdrop-blur-sm px-5 py-3.5 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/80 mb-1.5">
            <span>Tu cotización Artiq</span>
            <span className="tabular-nums">
              {formatCOP(artiqTotal)} <span className="text-white/50">/ $4.000.000</span>
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-white/15 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Avance hacia la hielera gratis"
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                qualifies ? 'bg-gradient-to-r from-amber-300 to-amber-400' : 'bg-gradient-to-r from-artiq-100 to-white'
              }`}
              style={{ width: `${Math.max(progress, artiqTotal > 0 ? 4 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold leading-snug flex items-start gap-1.5">
            {qualifies ? (
              <>
                <Check className="w-4 h-4 shrink-0 text-amber-300" />
                <span>¡Tu cotización ya califica! Déjanos tus datos para reservar tu hielera.</span>
              </>
            ) : artiqTotal > 0 ? (
              <span>
                Te faltan <strong className="text-amber-300">{formatCOP(missing)}</strong> en equipos Artiq para superar los $4.000.000 y ganarla.
              </span>
            ) : (
              <span>Agrega granizadoras, máquinas de hielo o dispensadores Artiq para participar.</span>
            )}
          </p>
        </div>
        </>
      )}
    </section>
  );
}
