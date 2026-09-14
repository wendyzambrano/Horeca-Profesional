import React from 'react';
import { Product } from '../types';
import { 
  X, 
  ShoppingCart, 
  Check, 
  Sparkles, 
  Snowflake, 
  Coffee, 
  Droplet, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  MessageCircle,
  Award
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToQuote: (productId: string, mode: 'purchase' | 'rent') => void;
  isInQuote: boolean;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToQuote,
  isInQuote,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const isArtiq = product.brand === 'artiq';

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hielo':
        return 'Máquina Fabricadora de Hielo';
      case 'granizadora':
        return 'Granizadora Profesional';
      case 'dispensador':
        return 'Dispensador de Bebidas Frías';
      case 'cafe':
        return 'Cafetera Espresso Comercial';
      case 'molino':
        return 'Molino de Café Profesional';
      default:
        return category;
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hola, estoy interesado en recibir información técnica y comercial del equipo: ${product.name} (Ref: ${product.id}).`
    );
    window.open(`https://wa.me/573000000000?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn overflow-y-auto"
      onClick={onClose}
      id="product-detail-modal-backdrop"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        id={`modal-prod-${product.id}`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono ${
              isArtiq ? 'bg-artiq-100 text-artiq-700' : 'bg-[#e8e0d4] text-[#5b4638] border border-[#8b5e3c]/20'
            }`}>
              {isArtiq ? 'Mundo Artiq' : 'Mundo Barístico'}
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              {getCategoryLabel(product.category)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Grid: Image + Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Left: Product Image Container */}
            <div className="sm:col-span-5 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200/70 flex flex-col items-center justify-center relative min-h-[220px] sm:min-h-[260px]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-48 sm:max-h-56 w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {isArtiq ? (
                    <Snowflake className="w-16 h-16 text-artiq-500 animate-pulse mb-2" />
                  ) : (
                    <Coffee className="w-16 h-16 text-[#8b5e3c] mb-2" />
                  )}
                  <span className="text-xs font-mono font-bold text-gray-600">
                    {product.name}
                  </span>
                </div>
              )}

              {/* Brand Logo Badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-gray-200/80 shadow-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                {isArtiq ? (
                  <img
                    src="https://artiq.com.co/wp-content/uploads/2026/09/AQ-logo-artiq-transparente-1.webp"
                    alt="Artiq"
                    className="h-4 sm:h-4.5 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img
                    src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg"
                    alt="Barístico"
                    className="h-4 sm:h-4.5 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Verified Quality Tag */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-gray-100 text-[10px] font-semibold text-emerald-700 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Garantía HORECA</span>
              </div>
            </div>

            {/* Right: Product Headline & Key Attributes */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center text-xs font-bold text-amber-500">
                    {'★'.repeat(Math.floor(product.rating))}
                    <span className="text-gray-600 ml-1.5 font-mono text-[11px]">
                      {product.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Ref: {product.id.toUpperCase()} • Grado Comercial
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description || 'Equipo de alto rendimiento diseñado para uso intensivo en hostelería, cafeterías de especialidad y negocios gastronómicos.'}
              </p>

              {/* Price Display */}
              <div className={`p-3.5 rounded-xl flex items-baseline justify-between border ${
                isArtiq ? 'bg-slate-50 border-slate-100' : 'bg-[#f4f1e4] border-[#e8e0d4]'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
                    Precio Sugerido
                  </span>
                  <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'
                  }`}>
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">COP</span>
                </div>

                <div className="text-right text-[11px] text-gray-500 font-medium hidden sm:block">
                  <span className="text-emerald-600 font-bold block">✓ Disponibilidad Inmediata</span>
                  <span>Facturación y soporte oficial</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onAddToQuote(product.id, 'purchase')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    isInQuote
                      ? isArtiq
                        ? 'bg-artiq-50 text-artiq-700 border-2 border-artiq-300 hover:bg-artiq-100'
                        : 'bg-[#f4f1e4] text-[#5b4638] border-2 border-[#8b5e3c]/60 hover:bg-[#e8e0d4]'
                      : isArtiq
                        ? 'bg-artiq-500 hover:bg-artiq-600 text-white shadow-md active:scale-98'
                        : 'bg-[#5b4638] hover:bg-[#1c1c1c] text-[#f4f1e4] shadow-md active:scale-98'
                  }`}
                >
                  {isInQuote ? (
                    <>
                      <Check className={`w-4 h-4 ${isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'}`} />
                      <span>Agregado al Presupuesto</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Añadir a Cotización</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className={`px-4 py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 ${
                    isArtiq
                      ? 'bg-artiq-600 hover:bg-artiq-700 text-white shadow-artiq-600/20'
                      : 'bg-[#8b5e3c] hover:bg-[#774d30] text-[#f4f1e4] shadow-[#8b5e3c]/20'
                  }`}
                  title="Contactar asesor especializado"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Asesoría Directa</span>
                </button>
              </div>

            </div>
          </div>

          {/* Key Features Highlights Grid */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Aspectos Clave del Equipo</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                      {feature.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 mt-1 leading-snug">
                      {feature.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Technical Specifications Table */}
          {product.specs && product.specs.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-sky-500" />
                <span>Ficha Técnica Detallada</span>
              </h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-3 sm:p-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {product.specs.map((spec, i) => {
                    const parts = spec.split(':');
                    const label = parts[0];
                    const val = parts.slice(1).join(':');
                    return (
                      <div 
                        key={i} 
                        className="flex justify-between items-baseline border-b border-gray-200/60 pb-1.5 last:border-0"
                      >
                        <span className="text-gray-500 text-[11px]">{label}:</span>
                        <span className="font-bold text-gray-800 text-[11px] text-right ml-2">{val || label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info strip */}
        <div className="bg-gray-100 px-4 sm:px-6 py-2.5 text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-1 border-t border-gray-200">
          <span>Envío e instalación técnica disponibles en toda Colombia.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:text-black font-bold text-xs"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
}
