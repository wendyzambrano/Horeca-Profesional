import React, { useEffect, useRef, useState } from 'react';
import QuoteSuccess from './QuoteSuccess';
import { Gift, X, User, Mail, MessageCircle, Send, CheckCircle2, ChevronDown, Package } from 'lucide-react';
import { PRODUCTS } from '../data';
import { Product } from '../types';
import { sendQuoteRequest } from '../wordpress';
import PromoHielera from './PromoHielera';

/** Segundos que espera el pop up antes de abrirse. */
const OPEN_DELAY_MS = 8000;
const SEEN_KEY = 'horeca_popup_visto';
/** Estado de la pestaña lateral "Obtener oferta": '1' visible, 'enviado' ya se registró. */
const TAB_KEY = 'horeca_popup_pestana';

interface Props {
  /** No abrir el pop up mientras el cliente está en la pestaña de cotización o viendo una ficha. */
  suppressed: boolean;
}

const BRAND_GROUPS: { label: string; match: (p: Product) => boolean }[] = [
  { label: 'Artiq · Frío y dispensación', match: (p) => p.brand === 'artiq' },
  { label: 'Barístico · Café y molinos', match: (p) => p.brand !== 'artiq' },
];

const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* sin almacenamiento: el pop up puede volver a salir en la siguiente visita */
  }
};

const readTab = () => {
  try {
    return window.sessionStorage.getItem(TAB_KEY);
  } catch {
    return null;
  }
};
const writeTab = (value: '1' | 'enviado') => {
  try {
    window.sessionStorage.setItem(TAB_KEY, value);
  } catch {
    /* sin almacenamiento: la pestaña solo dura mientras la página siga abierta */
  }
};

/**
 * Pop up de cotización: aparece una vez por visita a los pocos segundos,
 * muestra la promoción de la hielera y un formulario corto con la máquina de interés.
 */
export default function QuotePopup({ suppressed }: Props) {
  const [open, setOpen] = useState(false);
  // Pestaña lateral que aparece al cerrar el pop up sin enviar la solicitud.
  const [showTab, setShowTab] = useState(() => readTab() === '1');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [correo, setCorreo] = useState('');
  const [maquina, setMaquina] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ referencia: string; correo: string } | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const suppressedRef = useRef(suppressed);
  suppressedRef.current = suppressed;

  // Abrir a los pocos segundos, una sola vez por visita.
  useEffect(() => {
    if (readSeen()) return;
    let timer = window.setTimeout(function tryOpen() {
      if (suppressedRef.current) {
        timer = window.setTimeout(tryOpen, 4000); // reintenta cuando el cliente salga de la ficha o de la cotización
        return;
      }
      markSeen();
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Al corregir un campo, se quita el mensaje de error.
  useEffect(() => {
    setError('');
  }, [nombre, whatsapp, correo, maquina]);

  // Cerrar con Esc, bloquear el scroll de fondo y enfocar el primer campo.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePopup();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 250);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open]);

  function closePopup() {
    setOpen(false);
    if (done || readTab() === 'enviado') {
      setShowTab(false);
    } else {
      writeTab('1');
      setShowTab(true);
    }
  }

  const reopen = () => {
    setShowTab(false);
    setOpen(true);
  };

  if (!open) {
    if (!showTab || suppressed) return null;
    return (
      <button
        type="button"
        onClick={reopen}
        aria-label="Obtener oferta: hielera de 12 kg gratis"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[55] flex flex-col items-center gap-2 rounded-r-xl bg-artiq-500 hover:bg-artiq-600 text-white shadow-lg shadow-artiq-500/30 px-2 py-4 sm:px-2.5 sm:py-5 transition-all hover:pl-3 animate-fadeIn focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-artiq-500"
      >
        <Gift className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" aria-hidden="true" />
        <span
          className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.12em] whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Obtener oferta
        </span>
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError('');
    if (!nombre.trim() || !whatsapp.trim() || !correo.trim() || !maquina) {
      setError('Completa tu nombre, WhatsApp, correo y la máquina que te interesa.');
      return;
    }
    const product = PRODUCTS.find((p) => p.id === maquina) as (Product & { wcId?: number }) | undefined;
    setSending(true);
    const res = await sendQuoteRequest({
      nombre: nombre.trim(),
      whatsapp: whatsapp.trim(),
      correo: correo.trim(),
      origen: 'popup',
      empresa_web: honeypot,
      items: [{ productId: maquina, wcId: product?.wcId, quantity: 1 }],
    });
    setSending(false);
    if ('message' in res) {
      setError(res.message);
      return;
    }
    setDone({ referencia: res.referencia, correo: correo.trim() });
    writeTab('enviado');
  };

  const inputCls =
    'w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:border-artiq-500 focus:bg-white focus:ring-2 focus:ring-artiq-500/15 transition-all';
  const labelCls = 'block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => closePopup()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-cotizacion-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scaleUp"
      >
        <button
          type="button"
          onClick={() => closePopup()}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/45 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="p-3 sm:p-4 pb-0 sm:pb-0">
          <PromoHielera compact />
        </div>

        {done ? (
          <div className="p-5 sm:p-6">
            <QuoteSuccess
              compact
              referencia={done.referencia}
              correo={done.correo}
              buttonLabel="Seguir viendo el catálogo"
              onButton={() => closePopup()}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative p-5 sm:p-6 space-y-3.5" noValidate>
            <div>
              <h3 id="popup-cotizacion-titulo" className="text-lg font-bold text-gray-900 leading-tight">
                Solicita tu cotización
              </h3>
              <p className="text-xs text-gray-500 mt-1">Déjanos tus datos y te enviamos la cotización a tu correo.</p>
            </div>

            <div>
              <label htmlFor="popup-nombre" className={labelCls}>Nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input ref={firstFieldRef} id="popup-nombre" type="text" required autoComplete="name" placeholder="Tu nombre"
                  value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="popup-whatsapp" className={labelCls}>WhatsApp *</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input id="popup-whatsapp" type="tel" required inputMode="tel" autoComplete="tel" placeholder="Ej. 315 123 4567"
                    value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="popup-correo" className={labelCls}>Correo *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input id="popup-correo" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com"
                    value={correo} onChange={(e) => setCorreo(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="popup-maquina" className={labelCls}>¿Qué máquina te interesa? *</label>
              <div className="relative">
                <Package className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <select id="popup-maquina" required value={maquina} onChange={(e) => setMaquina(e.target.value)}
                  className={`${inputCls} pr-9 appearance-none ${maquina ? '' : 'text-gray-400'}`}>
                  <option value="" disabled>Elige una máquina</option>
                  {BRAND_GROUPS.map((g) => {
                    const items = PRODUCTS.filter(g.match);
                    if (!items.length) return null;
                    return (
                      <optgroup key={g.label} label={g.label}>
                        {items.map((p) => (
                          <option key={p.id} value={p.id} className="text-gray-800">
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Campo trampa para bots (oculto para las personas) */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
              <label htmlFor="popup-empresa-web">No llenar</label>
              <input id="popup-empresa-web" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            {error && (
              <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-artiq-600 hover:bg-artiq-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md disabled:opacity-60">
              <Send className="w-4 h-4" />
              {sending ? 'Enviando…' : 'Solicitar Cotización'}
            </button>
            <button type="button" onClick={() => closePopup()} className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 py-1">
              Ahora no, gracias
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
