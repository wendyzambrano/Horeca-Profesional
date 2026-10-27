import React, { useState, useEffect, useCallback } from 'react';
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
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Images
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToQuote: (productId: string, mode: 'purchase' | 'rent') => void;
  /** Agrega el equipo (si no está) y abre la pestaña de cotización con el formulario. */
  onRequestQuote?: (productId: string) => void;
  isInQuote: boolean;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToQuote,
  onRequestQuote,
  isInQuote,
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset image index when product changes or modal opens
  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }, [product?.id, isOpen]);

  const isArtiq = product?.brand === 'artiq';

  // Build the unified list of gallery images
  const galleryImages: string[] = React.useMemo(() => {
    if (!product) return [];
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    return product.image ? [product.image] : [];
  }, [product]);

  const currentImage = galleryImages[activeImageIndex] || product?.image;

  const handlePrev = useCallback(() => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length]);

  const handleNext = useCallback(() => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, galleryImages.length, handlePrev, handleNext, isLightboxOpen]);

  if (!isOpen || !product) return null;

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
          
          {/* Main Grid: Image Gallery + Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Left: Product Image Gallery */}
            <div className="sm:col-span-5 flex flex-col gap-2.5">
              {/* Main Image Box */}
              <div className="group/gallery relative bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4 sm:p-5 border border-gray-200/70 flex flex-col items-center justify-center min-h-[230px] sm:min-h-[270px] overflow-hidden">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - Imagen ${activeImageIndex + 1}`}
                    className="max-h-48 sm:max-h-56 w-auto max-w-full object-contain drop-shadow-md transition-all duration-300 group-hover/gallery:scale-105 cursor-zoom-in"
                    referrerPolicy="no-referrer"
                    onClick={() => setIsLightboxOpen(true)}
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

                {/* Brand Logo Badge at top-left */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-gray-200/80 shadow-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10">
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

                {/* Top-Right Badges: Counter + Fullscreen Zoom button */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {galleryImages.length > 1 && (
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Images className="w-3 h-3 text-white/80" />
                      <span>{activeImageIndex + 1}/{galleryImages.length}</span>
                    </span>
                  )}
                  {currentImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-xs transition-colors hover:text-black"
                      title="Ver en pantalla completa"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Prev / Next arrows (Visible on hover on desktop, always visible on mobile if > 1 images) */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover/gallery:opacity-100 hover:scale-105 active:scale-95 z-10"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover/gallery:opacity-100 hover:scale-105 active:scale-95 z-10"
                      title="Siguiente foto"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Verified Quality Tag at bottom-right */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-gray-100 text-[10px] font-semibold text-emerald-700 shadow-2xs z-10">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Garantía HORECA</span>
                </div>
              </div>

              {/* Thumbnails Strip (when there are 2 or more photos) */}
              {galleryImages.length > 1 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 px-0.5 scrollbar-thin">
                    {galleryImages.map((img, idx) => {
                      const isSelected = activeImageIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-white ${
                            isSelected
                              ? isArtiq
                                ? 'border-artiq-500 ring-2 ring-artiq-400/40 scale-105 shadow-xs'
                                : 'border-[#8b5e3c] ring-2 ring-[#8b5e3c]/40 scale-105 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                          }`}
                          title={`Ver imagen ${idx + 1}`}
                        >
                          <img
                            src={img}
                            alt={`Miniatura ${idx + 1}`}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center font-medium">
                    Haz clic en una miniatura o usa las flechas para explorar todos los ángulos
                  </p>
                </div>
              )}
            </div>

            {/* Right: Product Headline & Key Attributes */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center text-xs font-bold">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= Math.round(product.rating) ? 'text-amber-500' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-1.5 font-medium text-[11px]">
                      {product.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h2>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description || 'Equipo de alto rendimiento diseñado para uso intensivo en hostelería, cafeterías de especialidad y negocios gastronómicos.'}
              </p>

              {/* Price Display */}
              <div className={`p-3.5 rounded-xl flex items-center justify-between border ${
                isArtiq ? 'bg-slate-50 border-slate-100' : 'bg-[#f4f1e4] border-[#e8e0d4]'
              }`}>
                <div>
                {product.regularPrice && product.regularPrice > product.price && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                    <span className="text-sm text-gray-400 line-through tabular-nums whitespace-nowrap">
                      ${product.regularPrice.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-[11px] font-black text-white bg-red-500 rounded-md px-1.5 py-0.5 whitespace-nowrap">
                      Ahorras ${(product.regularPrice - product.price).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline">
                  <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'
                  }`}>
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold ml-1.5">COP</span>
                </div>
                </div>

                <div className="text-right text-[11px] text-gray-500 font-medium hidden sm:block">
                  <span className="text-emerald-600 font-bold block">✓ Disponibilidad Inmediata</span>
                  <span>Facturación y soporte oficial</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onRequestQuote) {
                      onRequestQuote(product.id);
                    } else {
                      if (!isInQuote) onAddToQuote(product.id, 'purchase');
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 ${
                    isArtiq
                      ? 'bg-artiq-500 hover:bg-artiq-600 text-white'
                      : 'bg-[#5b4638] hover:bg-[#1c1c1c] text-[#f4f1e4]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Solicitar Cotización</span>
                </button>
                {isInQuote && (
                  <p className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold ${isArtiq ? 'text-artiq-700' : 'text-[#5b4638]'}`}>
                    <Check className="w-3.5 h-3.5" />
                    Este equipo ya está en tu cotización
                  </p>
                )}
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
          <span>Envío disponible en toda Colombia.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:text-black font-bold text-xs"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white py-2 px-3 border-b border-white/15" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">{product.name}</span>
              {galleryImages.length > 1 && (
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full text-white/90 font-medium">
                  {activeImageIndex + 1} de {galleryImages.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              title="Cerrar visor de imágenes"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Main Large Image with Next / Prev */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none" onClick={(e) => e.stopPropagation()}>
            {currentImage && (
              <img
                src={currentImage}
                alt={`${product.name} - ${activeImageIndex + 1}`}
                className="max-h-[72vh] max-w-full object-contain drop-shadow-2xl transition-all duration-200"
                referrerPolicy="no-referrer"
              />
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title="Anterior (Flecha izquierda)"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title="Siguiente (Flecha derecha)"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-2 max-w-4xl mx-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all p-1 bg-white/10 ${
                    activeImageIndex === idx
                      ? 'border-white ring-2 ring-white/50 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  title={`Ver foto ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
