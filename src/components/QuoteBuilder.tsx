import React, { useState } from 'react';
import { RequestedProductItem, Product } from '../types';
import { PRODUCTS } from '../data';
import { isWordPress } from '../wordpress';
import { Trash2, ShoppingBag, Send, ArrowRight, Building2, User, Mail, Phone, MapPin, AlignLeft, CheckCircle2, MessageCircle } from 'lucide-react';
import PromoHielera from './PromoHielera';

interface QuoteBuilderProps {
  quoteItems: RequestedProductItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateMode: (productId: string, mode: 'purchase' | 'rent') => void;
  onSubmitInquiry: (contactData: {
    venueName: string;
    venueType: 'bar' | 'restaurante' | 'cafeteria' | 'discoteca' | 'hotel' | 'otro';
    city: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
  }) => void;
}

export default function QuoteBuilder({
  quoteItems,
  onUpdateQty,
  onRemoveItem,
  onUpdateMode,
  onSubmitInquiry
}: QuoteBuilderProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const getProductDetails = (productId: string): Product | undefined => {
    return PRODUCTS.find(p => p.id === productId);
  };

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hielo':
        return 'Máquina de Hielo';
      case 'granizadora':
        return 'Granizadora';
      case 'dispensador':
        return 'Dispensador';
      case 'cafe':
        return 'Máquina de Café';
      case 'molino':
        return 'Molino';
      default:
        return category;
    }
  };

  const calculateTotals = () => {
    let oneTimeTotal = 0;

    quoteItems.forEach(item => {
      const prod = getProductDetails(item.productId);
      if (prod) {
        oneTimeTotal += prod.price * item.quantity;
      }
    });

    return { oneTimeTotal, rentingMonthlyTotal: 0 };
  };

  const { oneTimeTotal, rentingMonthlyTotal } = calculateTotals();

  // Promoción: total cotizado en equipos Artiq (para la hielera gratis).
  const artiqTotal = quoteItems.reduce((sum, item) => {
    const prod = getProductDetails(item.productId);
    return prod && prod.brand === 'artiq' ? sum + prod.price * item.quantity : sum;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSendError('');
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setSendError('Completa tu nombre, WhatsApp y correo.');
      return;
    }

    let referencia = 'SOL-' + Math.floor(1000 + Math.random() * 9000);

    // En WordPress la solicitud se guarda y se envían los correos (al equipo y al cliente).
    if (isWordPress()) {
      setSending(true);
      try {
        const res = await fetch(`${window.HORECA_WP!.restUrl}solicitudes`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            nombre: contactName.trim(),
            whatsapp: contactPhone.trim(),
            correo: contactEmail.trim(),
            empresa_web: honeypot,
            items: quoteItems.map(item => ({
              productId: item.productId,
              wcId: (getProductDetails(item.productId) as (Product & { wcId?: number }) | undefined)?.wcId,
              quantity: item.quantity,
            })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setSendError(data?.message || 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
          setSending(false);
          return;
        }
        referencia = data.referencia || referencia;
      } catch {
        setSendError('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
        setSending(false);
        return;
      }
      setSending(false);
    }

    // El formulario solo pide nombre, WhatsApp y correo; los demás datos quedan vacíos.
    onSubmitInquiry({
      venueName: '',
      venueType: 'otro',
      city: '',
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      description: ''
    });

    setReferenceId(referencia);
    setSentEmail(contactEmail.trim());
    setSubmitted(true);

    // Reset form
    setContactName('');
    setContactEmail('');
    setContactPhone('');
  };

  if (submitted) {
    return (
      <div className="bg-white border border-emerald-100 rounded-3xl p-8 text-center max-w-2xl mx-auto my-6 shadow-sm animate-fadeIn" id="quote-success-banner">
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">¡Solicitud Enviada con Éxito!</h3>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
          Hemos registrado tu solicitud de cotización con la referencia <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{referenceId}</span>.
          {sentEmail && (
            <> Te enviamos la cotización a <span className="font-semibold text-gray-800">{sentEmail}</span>; si no la ves, revisa la carpeta de spam.</>
          )}
        </p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-2 mt-6 max-w-md mx-auto text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Estado de la solicitud:</span>
            <span className="font-bold text-emerald-600 uppercase">Enviada a asesores</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Siguiente paso:</span>
            <span className="text-gray-700">Un especialista oficial se comunicará contigo para formalizar la cotización</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          Solicitar Otro Equipamiento <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="quote-builder-panel">
      {/* ITEMS LIST (Left 7 Columns) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              Equipos Seleccionados
            </h3>
            <span className="text-xs bg-gray-100 font-bold font-mono px-2 py-0.5 rounded text-gray-600">
              {quoteItems.length} {quoteItems.length === 1 ? 'equipo' : 'equipos'}
            </span>
          </div>

          {quoteItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-gray-300 text-5xl mb-3">🛒</div>
              <p className="text-gray-600 font-medium">Tu cotización está vacía.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Navega por las secciones de **Mundo Artiq** o **Mundo Barístico** y añade los productos que necesitas para tu local de hostelería.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {quoteItems.map(item => {
                const prod = getProductDetails(item.productId);
                if (!prod) return null;
                const isArtiq = prod.brand === 'artiq';

                return (
                  <div key={item.productId} className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      {/* Brand indicator pill */}
                      <div className={`w-2.5 h-10 rounded ${isArtiq ? 'bg-artiq-500' : 'bg-baristico-500'}`}></div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold font-mono tracking-wider ${
                          isArtiq ? 'text-artiq-700' : 'text-baristico-700'
                        }`}>
                          {prod.brand} / {getCategoryLabel(prod.category)}
                        </span>
                        <h4 className="font-bold text-gray-950 text-sm leading-tight mt-0.5">
                          {prod.name}
                        </h4>
                        <div className="flex gap-4 items-center text-xs mt-1.5 text-gray-500">
                          <span className="font-medium text-gray-700">
                            Modo: <span className="font-bold text-gray-900">Compra Directa</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-2 sm:pt-0">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          onClick={() => item.quantity > 1 ? onUpdateQty(item.productId, item.quantity - 1) : onRemoveItem(item.productId)}
                          className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-semibold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-semibold"
                        >
                          +
                        </button>
                      </div>

                      {/* Total price for this item */}
                      <div className="text-right min-w-[70px]">
                        <span className="block text-xs text-gray-400 font-medium">Subtotal</span>
                        <span className="font-bold text-sm font-mono text-gray-900">
                          ${(prod.price * item.quantity).toLocaleString('es-CO')} COP
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Eliminar de la cotización"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SUMMARY PRICING CARD */}
        {quoteItems.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-md">
            <h4 className="text-xs uppercase font-bold font-mono tracking-widest text-gray-400 mb-2">
              Estimación Consolidada del Proyecto
            </h4>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Inversión Compra Directa</span>
              <span className="text-3xl font-extrabold font-mono text-baristico-100 block mt-1">
                ${oneTimeTotal.toLocaleString('es-CO')} COP
              </span>
              <p className="text-xs text-white/60 mt-1.5 leading-normal">
                Pago único directo. Incluye garantía técnica de fabricante oficial por 36 meses, instalación gratuita y soporte preventivo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FORM LEAD SUBMISSION (Right 5 Columns) */}
      <div className="lg:col-span-5">
        <form id="quote-form" onSubmit={handleSubmit} className="relative scroll-mt-32 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          {/* PROMOCIÓN: motiva a dejar los datos */}
          <div className="-mx-1 -mt-1">
            <PromoHielera artiqTotal={artiqTotal} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-700" />
            Tus datos de contacto
          </h3>

          <div>
            <label htmlFor="quote-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombre *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="quote-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Tu nombre"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-gray-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote-whatsapp" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              WhatsApp *
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="quote-whatsapp"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. 315 123 4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-gray-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Correo *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="quote-email"
                type="email"
                required
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-gray-800"
              />
            </div>
          </div>

          {/* Campo trampa para bots (oculto para las personas) */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor="quote-empresa-web">No llenar</label>
            <input id="quote-empresa-web" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          {sendError && (
            <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {sendError}
            </p>
          )}

          <button
            type="submit"
            disabled={quoteItems.length === 0 || sending}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando…' : 'Enviar Petición a Proveedores'}
          </button>
          
          <p className="text-[10px] text-gray-400 text-center leading-normal">
            Al enviar, tu solicitud será recibida por nuestro equipo comercial, quienes te contactarán con una cotización personalizada de forma inmediata.
          </p>
        </form>
      </div>
    </div>
  );
}
