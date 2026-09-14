import React, { useState, useEffect } from 'react';
import { Product, RequestedProductItem, Inquiry, PublicNeed, SupplierOffer } from './types';
import { PRODUCTS, INITIAL_INQUIRIES, INITIAL_PUBLIC_NEEDS } from './data';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ProfitabilityCalculator from './components/ProfitabilityCalculator';
import QuoteBuilder from './components/QuoteBuilder';
import { 
  Building2, ShoppingCart, Calculator, 
  Sparkles, Snowflake, Coffee, Layers, ChevronRight, HelpCircle, Info, CheckCircle, ChevronDown
} from 'lucide-react';

export default function App() {
  // Views navigation state
  const [currentView, setCurrentView] = useState<'catalog' | 'calculator' | 'quote'>('catalog');
  
  // Selected product for info modal
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  
  // Brand filtering in Catalog
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'artiq' | 'baristico'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Alternating header logo state (every 3 seconds)
  const [activeHeaderIso, setActiveHeaderIso] = useState<0 | 1>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeaderIso(prev => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Quotes (Cart) State with LocalStorage
  const [quoteItems, setQuoteItems] = useState<RequestedProductItem[]>(() => {
    const saved = localStorage.getItem('horeca_quote_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Inquiries State with LocalStorage
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('horeca_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  // Public Needs State with LocalStorage
  const [publicNeeds, setPublicNeeds] = useState<PublicNeed[]>(() => {
    const saved = localStorage.getItem('horeca_public_needs');
    return saved ? JSON.parse(saved) : INITIAL_PUBLIC_NEEDS;
  });

  // Backup state to LocalStorage
  useEffect(() => {
    localStorage.setItem('horeca_quote_items', JSON.stringify(quoteItems));
  }, [quoteItems]);

  useEffect(() => {
    localStorage.setItem('horeca_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('horeca_public_needs', JSON.stringify(publicNeeds));
  }, [publicNeeds]);

  // --- HANDLERS ---
  
  const handleAddToQuote = (productId: string, mode: 'purchase' | 'rent') => {
    setQuoteItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        // Toggle mode or increase qty
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1, mode } 
            : item
        );
      }
      return [...prev, { productId, quantity: 1, mode }];
    });
  };

  const handleUpdateQty = (productId: string, quantity: number) => {
    setQuoteItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateMode = (productId: string, mode: 'purchase' | 'rent') => {
    setQuoteItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, mode } : item
    ));
  };

  const handleSubmitInquiry = (contactData: {
    venueName: string;
    venueType: 'bar' | 'restaurante' | 'cafeteria' | 'discoteca' | 'hotel' | 'otro';
    city: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
  }) => {
    const newInquiry: Inquiry = {
      id: 'SOL-' + Math.floor(100 + Math.random() * 900),
      ...contactData,
      items: [...quoteItems],
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      offers: []
    };

    setInquiries(prev => [newInquiry, ...prev]);
    setQuoteItems([]); // Clear cart
  };

  const handleAddOffer = (inquiryId: string, offerData: Omit<SupplierOffer, 'id' | 'createdAt' | 'approved'>) => {
    const newOffer: SupplierOffer = {
      id: 'OFF-' + Math.floor(100 + Math.random() * 900),
      ...offerData,
      createdAt: new Date().toISOString(),
      approved: false
    };

    setInquiries(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: 'oferta_enviada',
          offers: [newOffer, ...inq.offers]
        };
      }
      return inq;
    }));
  };

  const handleApproveOffer = (inquiryId: string, offerId: string) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: 'aceptado',
          offers: inq.offers.map(off => ({
            ...off,
            approved: off.id === offerId
          }))
        };
      }
      return inq;
    }));
  };

  const handleAddPublicNeed = (needData: Omit<PublicNeed, 'id' | 'createdAt' | 'replies'>) => {
    const newNeed: PublicNeed = {
      id: 'NEED-' + Math.floor(100 + Math.random() * 900),
      ...needData,
      createdAt: new Date().toISOString(),
      replies: []
    };

    setPublicNeeds(prev => [newNeed, ...prev]);
  };

  const handleAddReplyToNeed = (needId: string, replyData: { supplierName: string; message: string; costEstimate: string }) => {
    const newReply = {
      id: 'REP-' + Math.floor(100 + Math.random() * 900),
      ...replyData,
      createdAt: new Date().toISOString()
    };

    setPublicNeeds(prev => prev.map(need => {
      if (need.id === needId) {
        return {
          ...need,
          replies: [...need.replies, newReply]
        };
      }
      return need;
    }));
  };

  const scrollToCatalogCategory = (brand: 'all' | 'artiq' | 'baristico') => {
    setCurrentView('catalog');
    setSelectedBrand(brand);
    setSelectedCategory('all');

    // Desplazarse de inmediato a la sección de la categoría seleccionada
    setTimeout(() => {
      let targetElement: HTMLElement | null = null;
      if (brand === 'artiq') {
        targetElement = document.getElementById('mundo-artiq-card') || document.getElementById('mundos-horeca') || document.getElementById('mobile-catalog-sliders');
      } else if (brand === 'baristico') {
        targetElement = document.getElementById('mundo-baristico-card') || document.getElementById('mundos-horeca') || document.getElementById('mobile-catalog-sliders');
      } else {
        targetElement = document.getElementById('equipamiento-disponible') || document.getElementById('mobile-catalog-sliders');
      }

      if (targetElement) {
        const headerOffset = 115; // 64px barra superior fija + ~48px menú móvil flotante + margen
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    }, 60);
  };

  // Filter products based on selected brand & category
  const filteredProducts = PRODUCTS.filter(p => {
    const brandMatches = selectedBrand === 'all' || 
                         (selectedBrand === 'artiq' ? p.brand === 'artiq' : p.brand !== 'artiq');
    
    let categoryMatches = false;
    if (selectedCategory === 'all') {
      categoryMatches = true;
    } else if (selectedCategory === 'granizados_bebidas') {
      categoryMatches = p.category === 'granizadora' || p.category === 'dispensador';
    } else if (selectedCategory === 'hielo') {
      categoryMatches = p.category === 'hielo';
    } else if (selectedCategory === 'espresso_cafe') {
      categoryMatches = p.category === 'cafe' || p.category === 'molino';
    } else {
      categoryMatches = p.category === selectedCategory;
    }
    
    return brandMatches && categoryMatches;
  });

  // Mobile sliders product lists (Artiq and Coffee/Barístico worlds)
  const mobileArtiqProducts = PRODUCTS.filter(p => {
    const brandMatches = p.brand === 'artiq' && (selectedBrand === 'all' || selectedBrand === 'artiq');
    let categoryMatches = false;
    if (selectedCategory === 'all') {
      categoryMatches = true;
    } else if (selectedCategory === 'granizados_bebidas') {
      categoryMatches = p.category === 'granizadora' || p.category === 'dispensador';
    } else if (selectedCategory === 'hielo') {
      categoryMatches = p.category === 'hielo';
    } else if (selectedCategory === 'espresso_cafe') {
      categoryMatches = p.category === 'cafe' || p.category === 'molino';
    } else {
      categoryMatches = p.category === selectedCategory;
    }
    return brandMatches && categoryMatches;
  });

  const mobileBaristicoProducts = PRODUCTS.filter(p => {
    const brandMatches = p.brand !== 'artiq' && (selectedBrand === 'all' || selectedBrand === 'baristico' || selectedBrand === p.brand);
    let categoryMatches = false;
    if (selectedCategory === 'all') {
      categoryMatches = true;
    } else if (selectedCategory === 'granizados_bebidas') {
      categoryMatches = p.category === 'granizadora' || p.category === 'dispensador';
    } else if (selectedCategory === 'hielo') {
      categoryMatches = p.category === 'hielo';
    } else if (selectedCategory === 'espresso_cafe') {
      categoryMatches = p.category === 'cafe' || p.category === 'molino';
    } else {
      categoryMatches = p.category === selectedCategory;
    }
    return brandMatches && categoryMatches;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between selection:bg-sky-500 selection:text-white" id="universo-horeca-root">
      
      {/* GLOBAL HEAD NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo area */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setCurrentView('catalog'); setSelectedBrand('all'); }}>
              <div 
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center p-1.5 shadow-sm border transition-colors duration-500 overflow-hidden ${
                  activeHeaderIso === 0 
                    ? 'bg-sky-50 border-sky-200' 
                    : 'bg-[#f4f1e4] border-[#8b5e3c]/20'
                }`}
              >
                <img
                  src="https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-2.svg"
                  alt="Isotipo Artiq"
                  className={`absolute w-6 h-6 object-contain transition-all duration-500 ${
                    activeHeaderIso === 0 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <img
                  src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg"
                  alt="Isotipo Barístico"
                  className={`absolute w-6 h-6 object-contain transition-all duration-500 ${
                    activeHeaderIso === 1 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight text-gray-900 block">
                  HORECA PROFESIONAL
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                  Plataforma B2B de Hostelería
                </span>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                type="button"
                onClick={() => setCurrentView('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  currentView === 'catalog' 
                    ? 'bg-gray-100 text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Catálogo de Equipos
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentView('calculator')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  currentView === 'calculator' 
                    ? 'bg-gray-100 text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                Simulador de Rentabilidad
              </button>
            </nav>

            {/* Right-aligned interactions (Active cart badge / Contact details) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('quote')}
                className={`relative p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  currentView === 'quote' 
                    ? 'border-gray-900 bg-gray-50 text-gray-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title="Presupuesto actual"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="hidden sm:inline text-xs font-bold">Mi Presupuesto</span>
                {quoteItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {quoteItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FLOATING HEADER NAV (For small touchscreens: World / Brand selector) */}
      <div className="md:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 py-2 shadow-xs">
        <div className="flex items-center justify-center p-1 bg-gray-100/90 rounded-2xl max-w-sm mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => scrollToCatalogCategory('all')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              currentView === 'catalog' && selectedBrand === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => scrollToCatalogCategory('artiq')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              currentView === 'catalog' && selectedBrand === 'artiq'
                ? 'bg-artiq-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mundo Artiq
          </button>
          <button
            type="button"
            onClick={() => scrollToCatalogCategory('baristico')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              currentView === 'catalog' && selectedBrand === 'baristico'
                ? 'bg-[#5b4638] text-[#f4f1e4] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mundo Barístico
          </button>
        </div>
      </div>

      {/* FULL-SCREEN HERO BANNER */}
      {currentView === 'catalog' && (
        <section className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center overflow-hidden bg-gray-950 px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          {/* Background Image with Enhanced Visibility */}
          <img 
            src="https://artiq.com.co/wp-content/uploads/2026/09/horeca-profesional.1-1.webp" 
            alt="Horeca Profesional - Maquinaria y Equipamiento Hostelero" 
            className="absolute inset-0 w-full h-full object-cover object-center scale-100"
            referrerPolicy="no-referrer"
          />
          
          {/* Balanced Overlays: Image is clearly visible with smooth contrast for text */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-black/20" />

          {/* Text of the First Section on Top of Banner */}
          <div className="relative z-10 max-w-4xl mx-auto space-y-6 flex flex-col items-center animate-fadeIn px-2">
            {/* Category Tag / Badge */}
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25 shadow-xl text-white">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-bold uppercase tracking-wider font-sans text-white">
                Suministro Premium de Hostelería
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)] max-w-3xl">
              Equipa tu negocio con la maquinaria líder en hostelería
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-medium">
              Simplificamos el equipamiento de tu negocio hostelero. Conecta de forma directa con las marcas de referencia en refrigeración comercial y café de especialidad para maximizar tu eficiencia y calidad.
            </p>
          </div>

          {/* Scroll Down Indicator */}
          <button
            type="button"
            onClick={() => {
              document.getElementById('mundos-horeca')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Desplazarse a mundos horeca"
            className="absolute bottom-6 z-10 text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1 animate-bounce"
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Descubre Más</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </section>
      )}

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* VIEW 1: CATALOGUE AND DUAL WORLD SPLIT VIEW */}
        {currentView === 'catalog' && (
          <div className="space-y-10 animate-fadeIn">

            {/* DUAL MUNDOS PANEL (Split visual selector) */}
            <div className={`grid-cols-1 md:grid-cols-2 gap-6 pt-2 ${selectedBrand === 'all' ? 'hidden md:grid' : 'grid'}`} id="mundos-horeca">
              
              {/* BRAND CARD: ARTIQ */}
              <div 
                id="mundo-artiq-card"
                onClick={() => { setSelectedBrand('artiq'); setSelectedCategory('all'); }}
                className={`relative overflow-hidden rounded-3xl border p-8 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedBrand === 'artiq' ? 'block' : 'hidden md:block'
                } ${
                  selectedBrand === 'artiq'
                    ? 'bg-artiq-50/70 border-artiq-500 ring-2 ring-artiq-100 scale-[1.01]'
                    : 'bg-white border-gray-100 hover:border-artiq-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                  <img 
                    src="https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-2.svg" 
                    alt="Artiq Marca de Agua" 
                    className="w-48 h-48 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="bg-artiq-500 text-white p-2.5 rounded-2xl shadow-md flex items-center justify-center w-12 h-12">
                    <img 
                      src="https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-1.svg" 
                      alt="Artiq Isotipo" 
                      className="w-7 h-7 object-contain animate-pulse"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-artiq-600 bg-artiq-50 px-2.5 py-1 rounded-full uppercase">
                    Mundo Artiq
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Artiq | Refrigeración y Dispensación Comercial</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Tecnología avanzada diseñada para maximizar la rentabilidad de tu negocio y agilizar el servicio de bebidas. Equipamiento robusto con alta eficiencia para un rendimiento continuo.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-artiq-700">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('artiq');
                      setSelectedCategory('granizadora');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-artiq-100/70 hover:bg-artiq-200/80 active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-artiq-200/30"
                  >
                    Granizadoras
                  </span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('artiq');
                      setSelectedCategory('hielo');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-artiq-100/70 hover:bg-artiq-200/80 active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-artiq-200/30"
                  >
                    Máquinas de Hielo
                  </span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('artiq');
                      setSelectedCategory('dispensador');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-artiq-100/70 hover:bg-artiq-200/80 active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-artiq-200/30"
                  >
                    Dispensadores
                  </span>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-artiq-700 gap-1">
                  <span>Filtrar catálogo por Artiq</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* BRAND CARD: BARISTICO */}
              <div 
                id="mundo-baristico-card"
                onClick={() => { setSelectedBrand('baristico'); setSelectedCategory('all'); }}
                className={`relative overflow-hidden rounded-3xl border p-8 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedBrand === 'baristico' ? 'block' : 'hidden md:block'
                } ${
                  selectedBrand === 'baristico'
                    ? 'bg-[#f4f1e4] border-[#5b4638] ring-2 ring-[#8b5e3c]/30 scale-[1.01] shadow-md'
                    : 'bg-white border-gray-100 hover:border-[#8b5e3c]/50'
                }`}
              >
                <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                  <img 
                    src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg" 
                    alt="Barístico Marca de Agua" 
                    className="w-48 h-48 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex justify-between items-start">
                  <div className="bg-[#5b4638] text-[#f4f1e4] p-2.5 rounded-2xl shadow-md flex items-center justify-center w-12 h-12">
                    <img 
                      src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.1.svg" 
                      alt="Barístico Isotipo" 
                      className="w-7 h-7 object-contain animate-pulse"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-[#5b4638] bg-[#e8e0d4] px-2.5 py-1 rounded-full uppercase border border-[#8b5e3c]/20">
                    Mundo Barístico
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-extrabold text-[#1c1c1c] tracking-tight">Barístico | Café y Molienda de Especialidad</h3>
                  <p className="text-sm text-[#5b4638] mt-2 leading-relaxed font-medium">
                    Maquinaria de alta precisión para negocios que buscan la excelencia en cada taza. Equipos diseñados para mantener una consistencia impecable en el servicio, acompañados de molinos silenciosos de gran capacidad para entornos hosteleros de alta exigencia.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#5b4638]">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('baristico');
                      setSelectedCategory('cafe');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#e8e0d4] text-[#5b4638] hover:bg-[#8b5e3c] hover:text-[#f4f1e4] active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-[#8b5e3c]/30"
                  >
                    Cafeteras Espresso
                  </span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('baristico');
                      setSelectedCategory('molino');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#e8e0d4] text-[#5b4638] hover:bg-[#8b5e3c] hover:text-[#f4f1e4] active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-[#8b5e3c]/30"
                  >
                    Molinos On-Demand
                  </span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand('baristico');
                      setSelectedCategory('cafe');
                      document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#e8e0d4] text-[#5b4638] hover:bg-[#8b5e3c] hover:text-[#f4f1e4] active:scale-95 cursor-pointer px-3 py-1.5 rounded-xl transition-all shadow-sm border border-[#8b5e3c]/30"
                  >
                    Efectividad PID
                  </span>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-[#8b5e3c] gap-1">
                  <span>Filtrar catálogo por Barístico</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* FILTER BUTTONS ROW */}
            <div 
              id="equipamiento-disponible" 
              className={`bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 ${
                selectedBrand !== 'all' ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Equipamiento Disponible</h3>
                  <p className="text-xs text-gray-500">Selecciona una categoría para acotar tu búsqueda técnica.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedBrand('all'); setSelectedCategory('all'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedBrand === 'all' && selectedCategory === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Todos los Mundos
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedBrand('artiq'); setSelectedCategory('all'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedBrand === 'artiq' && selectedCategory === 'all'
                        ? 'bg-artiq-500 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Ver Todo Artiq
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedBrand('baristico'); setSelectedCategory('all'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBrand === 'baristico' && selectedCategory === 'all'
                        ? 'bg-[#5b4638] text-[#f4f1e4] ring-2 ring-[#8b5e3c]/40 shadow-sm'
                        : 'bg-[#f4f1e4] text-[#5b4638] hover:bg-[#e8e0d4] border border-[#e8e0d4]'
                    }`}
                  >
                    Ver Todo Barístico
                  </button>
                </div>
              </div>

              {/* Categorization chips */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-400 font-medium py-1">Filtrar Categoría:</span>
                
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gray-200 border-gray-300 text-gray-900 font-bold'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Todas las categorías
                </button>

                <button
                  onClick={() => setSelectedCategory('granizados_bebidas')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                    selectedCategory === 'granizados_bebidas'
                      ? 'bg-artiq-100 border-artiq-500 text-artiq-700 font-bold'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  GRANIZADOS & BEBIDAS
                </button>

                <button
                  onClick={() => setSelectedCategory('dispensador')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                    selectedCategory === 'dispensador'
                      ? 'bg-artiq-100 border-artiq-500 text-artiq-700 font-bold'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  DISPENSADORES
                </button>

                <button
                  onClick={() => setSelectedCategory('hielo')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                    selectedCategory === 'hielo'
                      ? 'bg-artiq-100 border-artiq-500 text-artiq-700 font-bold'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  MÁQUINAS DE HIELO
                </button>

                <button
                  onClick={() => setSelectedCategory('espresso_cafe')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                    selectedCategory === 'espresso_cafe'
                      ? 'bg-[#e8e0d4] border-[#8b5e3c] text-[#5b4638] font-black shadow-xs ring-1 ring-[#8b5e3c]/20'
                      : 'border-gray-200 text-gray-500 hover:bg-[#f4f1e4] hover:text-[#5b4638]'
                  }`}
                >
                  ESPRESSO & CAFÉ
                </button>
              </div>
            </div>

            {/* PRODUCT CATALOG GRID (2-Column Web Catalog Layout) */}
            <div id="mobile-catalog-sliders" className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-xs text-gray-500 font-medium">
                    Mostrando <strong className="text-gray-900">{filteredProducts.length}</strong> equipos disponibles
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-[11px]">Catálogo Oficial</span>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5" id="catalog-products-grid">
                  {filteredProducts.map(prod => {
                    const isInQuote = quoteItems.some(item => item.productId === prod.id);
                    return (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddToQuote={handleAddToQuote}
                        isInQuote={isInQuote}
                        onOpenDetails={(p) => setSelectedDetailProduct(p)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xs max-w-md mx-auto my-6">
                  <p className="text-gray-700 font-bold text-base">No hay productos que coincidan</p>
                  <p className="text-xs text-gray-400 mt-1">Intenta restablecer los filtros para descubrir los productos de Artiq y Barístico.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedBrand('all'); setSelectedCategory('all'); }}
                    className="mt-4 bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>

            {/* ADVISORY SECTION FOR PROPRIETORS */}
            <div 
              className={`rounded-3xl p-6 sm:p-8 ${selectedBrand === 'all' ? 'hidden md:flex' : 'flex'} flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 shadow-xl ${
                selectedBrand === 'artiq'
                  ? 'bg-gradient-to-br from-artiq-700 via-artiq-800 to-artiq-600 border border-artiq-500/30 text-white'
                  : selectedBrand === 'baristico'
                  ? 'bg-gradient-to-br from-[#1c1c1c] via-[#3b2c23] to-[#5b4638] border border-[#8b5e3c]/40 text-[#f4f1e4]'
                  : 'bg-gradient-to-br from-gray-900 to-slate-800 border border-gray-800 text-white'
              }`}
            >
              <div className="space-y-2 max-w-xl">
                <span 
                  className={`text-[10px] font-bold uppercase tracking-widest font-mono px-2.5 py-1 rounded-full border inline-block transition-colors ${
                    selectedBrand === 'artiq'
                      ? 'text-cyan-300 bg-artiq-500/20 border-artiq-500/30'
                      : 'text-[#dfd4c5] bg-[#8b5e3c]/30 border-[#8b5e3c]/40'
                  }`}
                >
                  Orientación de Inversiones
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  ¿Quieres calcular el Retorno de Inversión (ROI)?
                </h3>
                <p 
                  className={`text-sm leading-relaxed transition-colors ${
                    selectedBrand === 'artiq'
                      ? 'text-artiq-50/85'
                      : 'text-[#e8e0d4]/90'
                  }`}
                >
                  Utiliza nuestro simulador para entender las métricas de tu negocio Horeca. Calcula el retorno en base a tus ventas diarias y descubre los meses de amortización rápida de tus equipos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('calculator')}
                className={`font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 active:scale-95 ${
                  selectedBrand === 'artiq'
                    ? 'bg-artiq-500 hover:bg-[#0da6d8]/90 text-white shadow-artiq-500/25'
                    : 'bg-[#8b5e3c] hover:bg-[#a3724a] text-[#f4f1e4] shadow-[#8b5e3c]/25 border border-[#dfd4c5]/20'
                }`}
              >
                Abrir Simulador Financiero
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: PROFITABILITY CALCULATOR */}
        {currentView === 'calculator' && (
          <div className="space-y-6 animate-fadeIn">
            <ProfitabilityCalculator />
          </div>
        )}

        {/* VIEW 3: MY QUOTE (CART / LEAD BUILDER) */}
        {currentView === 'quote' && (
          <div className="space-y-6 animate-fadeIn">
            <QuoteBuilder
              quoteItems={quoteItems}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onUpdateMode={handleUpdateMode}
              onSubmitInquiry={handleSubmitInquiry}
            />
          </div>
        )}

      </main>

      {/* Product Detail Modal (Web Catalog Quick Info) */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={Boolean(selectedDetailProduct)}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToQuote={handleAddToQuote}
        isInQuote={quoteItems.some(i => i.productId === selectedDetailProduct?.id)}
      />

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-1.5">
            <span className="font-extrabold text-gray-900 tracking-tight">Horeca profesional</span>
            <span>|</span>
            <span>Conectando de forma eficiente la hostelería colombiana con distribuidores autorizados.</span>
          </div>
          <div className="flex justify-center gap-6 text-gray-500 font-medium">
            <button type="button" onClick={() => { setCurrentView('catalog'); setSelectedBrand('artiq'); setSelectedCategory('all'); }} className="hover:text-sky-600 transition-colors">Maquinaria Artiq</button>
            <button type="button" onClick={() => { setCurrentView('catalog'); setSelectedBrand('baristico'); setSelectedCategory('all'); }} className="hover:text-amber-800 transition-colors">Equipamiento Barístico</button>
            <button type="button" onClick={() => setCurrentView('calculator')} className="hover:text-gray-800 transition-colors">Simulador Financiero</button>
          </div>
          <p className="text-[10px]">
            &copy; {new Date().getFullYear()} Horeca profesional. Todos los derechos reservados. Las estimaciones son orientativas y se calculan basándose en costes medios del sector en Colombia.
          </p>
        </div>
      </footer>

    </div>
  );
}
