import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Plus, Send, X } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product | null;
  /** Cantidad de equipos distintos en la cotización. */
  itemsCount: number;
  onKeepShopping: () => void;
  onRequestQuote: () => void;
}

/**
 * Aviso que sale al tocar "Cotizar" en una tarjeta:
 * permite seguir agregando productos o ir a solicitar la cotización.
 */
export default function AddedToQuoteDialog({ product, itemsCount, onKeepShopping, onRequestQuote }: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onKeepShopping();
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => primaryRef.current?.focus(), 150);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [product, onKeepShopping]);

  if (!product) return null;

  const isArtiq = product.brand === 'artiq';
  const image = product.image || product.gallery?.[0];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-950/50 backdrop-blur-[2px] animate-fadeIn"
      onClick={onKeepShopping}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="added-quote-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-scaleUp"
      >
        <button
          type="button"
          onClick={onKeepShopping}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
          <h3 id="added-quote-title" className="text-base font-bold text-gray-900">
            Agregado a tu cotización
          </h3>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          {image && (
            <img
              src={image}
              alt=""
              className="w-16 h-16 shrink-0 rounded-xl bg-white object-contain p-1"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{product.name}</p>
            <p className={`text-sm font-black mt-0.5 ${isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'}`}>
              ${product.price.toLocaleString('es-CO')} <span className="text-[11px] font-semibold text-gray-400">COP</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tienes <strong className="text-gray-800">{itemsCount} {itemsCount === 1 ? 'equipo' : 'equipos'}</strong> en tu cotización.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onKeepShopping}
            className="order-2 sm:order-1 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm py-3 px-3 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar más productos
          </button>
          <button
            ref={primaryRef}
            type="button"
            onClick={onRequestQuote}
            className={`order-1 sm:order-2 flex items-center justify-center gap-1.5 rounded-xl text-white font-bold text-sm py-3 px-3 shadow-md transition-all ${
              isArtiq ? 'bg-artiq-500 hover:bg-artiq-600' : 'bg-[#5b4638] hover:bg-[#1c1c1c]'
            }`}
          >
            <Send className="w-4 h-4" />
            Solicitar cotización
          </button>
        </div>
      </div>
    </div>
  );
}
