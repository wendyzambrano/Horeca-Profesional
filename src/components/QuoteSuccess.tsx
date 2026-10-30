import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  referencia: string;
  correo?: string;
  buttonLabel: string;
  onButton: () => void;
  /** Versión más compacta para usar dentro del pop up. */
  compact?: boolean;
}

/**
 * Confirmación que ve el cliente al enviar su solicitud de cotización.
 * Se usa igual en el formulario de cotización y en el pop up.
 */
export default function QuoteSuccess({ referencia, correo, buttonLabel, onButton, compact = false }: Props) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 ${
          compact ? 'w-14 h-14' : 'w-16 h-16'
        }`}
      >
        <CheckCircle2 className={compact ? 'w-8 h-8' : 'w-10 h-10'} />
      </div>
      <h3 className={`font-bold text-gray-900 tracking-tight ${compact ? 'text-xl' : 'text-2xl'}`}>
        ¡Solicitud Enviada con Éxito!
      </h3>
      <p className="text-gray-600 mt-2 text-sm leading-relaxed">
        Hemos registrado tu solicitud de cotización con la referencia{' '}
        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded whitespace-nowrap">{referencia}</span>.
        {correo && (
          <>
            {' '}Te enviamos la cotización a <span className="font-semibold text-gray-800 break-words">{correo}</span>; si no la ves,
            revisa la carpeta de spam.
          </>
        )}
      </p>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left mt-5 max-w-md mx-auto text-sm divide-y divide-gray-200/70">
        <div className="pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Estado de la solicitud</p>
          <p className="mt-0.5 font-bold text-emerald-600">Enviada a asesores</p>
        </div>
        <div className="pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Siguiente paso</p>
          <p className="mt-0.5 text-gray-700 leading-relaxed">
            Un especialista oficial se comunicará contigo para formalizar la cotización.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onButton}
        className="mt-6 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
      >
        {buttonLabel} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
