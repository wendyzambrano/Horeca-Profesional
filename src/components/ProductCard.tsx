import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Info, 
  ShoppingCart, 
  Check, 
  Snowflake, 
  Coffee, 
  Eye, 
  Droplet, 
  HardDrive,
  Sparkles
} from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onAddToQuote: (productId: string, mode: 'purchase' | 'rent') => void;
  isInQuote: boolean;
  onOpenDetails?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onAddToQuote, 
  isInQuote,
  onOpenDetails 
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isArtiq = product.brand === 'artiq';

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hielo':
        return 'Máquina de Hielo';
      case 'granizadora':
        return 'Granizadora';
      case 'dispensador':
        return 'Dispensador';
      case 'cafe':
        return 'Cafetera Espresso';
      case 'molino':
        return 'Molino';
      default:
        return category;
    }
  };

  const handleOpenInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetails) {
      onOpenDetails(product);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div 
        className={`group bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 hover:border-gray-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
          isArtiq 
            ? 'hover:border-artiq-400 focus-within:ring-2 focus-within:ring-artiq-100' 
            : 'hover:border-[#8b5e3c] focus-within:ring-2 focus-within:ring-[#8b5e3c]/20'
        }`}
        id={`prod-${product.id}`}
        onClick={handleOpenInfo}
      >
        {/* Top: Product Image Box with Badges */}
        <div className="relative w-full aspect-square sm:aspect-4/3 bg-gradient-to-b from-gray-50 to-slate-100/70 p-3 sm:p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
          
          {/* Subtle brand tag at top-left */}
          <div className="absolute top-2 left-2 z-10">
            {isArtiq ? (
              <div className="bg-white/95 backdrop-blur-xs border border-gray-200 shadow-2xs px-2 py-0.5 rounded-md flex items-center gap-1">
                <img 
                  src="https://artiq.com.co/wp-content/uploads/2026/09/AQ-logo-artiq-transparente-1.webp" 
                  alt="Artiq" 
                  className="h-3.5 sm:h-4 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-xs border border-gray-200 shadow-2xs px-2 py-0.5 rounded-md flex items-center gap-1">
                <img 
                  src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg" 
                  alt="Barístico" 
                  className="h-3.5 sm:h-4 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Category Chip at top-right */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md font-mono ${
              isArtiq ? 'bg-artiq-50 text-artiq-700 border border-artiq-200/60' : 'bg-[#f4f1e4] text-[#5b4638] border border-[#e8e0d4]'
            }`}>
              {getCategoryLabel(product.category)}
            </span>
          </div>

          {/* Product Image */}
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-28 sm:max-h-36 w-auto max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-108"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              {isArtiq ? (
                <Snowflake className="w-10 h-10 sm:w-12 sm:h-12 text-artiq-500" />
              ) : (
                <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-[#8b5e3c]" />
              )}
              <span className="text-[10px] font-mono text-gray-500 mt-1 font-bold">
                {product.name}
              </span>
            </div>
          )}

          {/* Quick Hover Badge */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
            <span className="text-[10px] font-bold text-white flex items-center gap-1">
              <Eye className="w-3 h-3" /> Clic para ver ficha completa
            </span>
          </div>
        </div>

        {/* Middle: Product Content (Name & Price) */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mb-1">
              <span>★</span>
              <span className="text-gray-600 font-medium text-[10px] sm:text-xs">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400 font-mono text-[9px] sm:text-[10px]">
                Ref: {product.id.slice(0, 10)}
              </span>
            </div>

            {/* Product Name (Clean 2-line clamp) */}
            <h3 className={`text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] transition-colors ${
              isArtiq ? 'group-hover:text-artiq-800' : 'group-hover:text-[#5b4638]'
            }`}>
              {product.name}
            </h3>

            {/* Main Highlight Feature */}
            {product.features && product.features[0] && (
              <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 mt-1 font-medium">
                <span className="text-gray-400">{product.features[0].label}:</span> {product.features[0].value}
              </p>
            )}
          </div>

          {/* Price & Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-gray-100">
            <div className="mb-2.5">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 font-mono block">
                Precio Sugerido
              </span>
              <div className="flex items-baseline">
                <span className={`text-sm sm:text-lg font-black tracking-tight ${
                  isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'
                }`}>
                  ${product.price.toLocaleString('es-CO')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 ml-1 font-mono">COP</span>
              </div>
            </div>

            {/* Buttons Row: "Ver info" and "Añadir / Cotizar" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              
              {/* "Ver info" Button */}
              <button
                type="button"
                id={`btn-info-${product.id}`}
                onClick={handleOpenInfo}
                className="w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-lg bg-gray-100 hover:bg-gray-200/80 active:bg-gray-300 text-gray-700 font-bold text-[11px] sm:text-xs transition-all"
                title="Ver ficha técnica y detalles"
              >
                <Info className="w-3.5 h-3.5 text-gray-500" />
                <span>Ver info</span>
              </button>

              {/* Add to Quote Button */}
              <button
                type="button"
                id={`btn-add-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToQuote(product.id, 'purchase');
                }}
                className={`w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all shadow-2xs ${
                  isInQuote
                    ? isArtiq
                      ? 'bg-artiq-50 text-artiq-700 border border-artiq-300 hover:bg-artiq-100'
                      : 'bg-[#f4f1e4] text-[#5b4638] border border-[#8b5e3c]/60 hover:bg-[#e8e0d4]'
                    : isArtiq
                      ? 'bg-artiq-500 hover:bg-artiq-600 text-white'
                      : 'bg-[#5b4638] hover:bg-[#1c1c1c] text-[#f4f1e4]'
                }`}
                title={isInQuote ? 'Añadido a cotización' : 'Añadir a cotización'}
              >
                {isInQuote ? (
                  <>
                    <Check className={`w-3.5 h-3.5 ${isArtiq ? 'text-artiq-600' : 'text-[#8b5e3c]'}`} />
                    <span className="hidden sm:inline">Añadido</span>
                    <span className="sm:hidden">✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Cotizar</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Standalone Product Detail Modal */}
      {!onOpenDetails && (
        <ProductDetailModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToQuote={onAddToQuote}
          isInQuote={isInQuote}
        />
      )}
    </>
  );
}
