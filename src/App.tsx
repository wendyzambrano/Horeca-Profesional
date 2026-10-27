import React, { useState, useEffect } from 'react';
import { Product, RequestedProductItem, Inquiry, PublicNeed, SupplierOffer } from './types';
import { PRODUCTS, INITIAL_INQUIRIES, INITIAL_PUBLIC_NEEDS } from './data';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ProfitabilityCalculator from './components/ProfitabilityCalculator';
import QuoteBuilder from './components/QuoteBuilder';
import WorldCategoryBar from './components/WorldCategoryBar';
import QuotePopup from './components/QuotePopup';
import AddedToQuoteDialog from './components/AddedToQuoteDialog';
import { 
  Building2, ShoppingCart, Calculator, 
  Sparkles, Snowflake, Coffee, Layers, ChevronRight, HelpCircle, Info, CheckCircle, ChevronDown,
  Share2, Link as LinkIcon, Check, Copy
} from 'lucide-react';

export default function App() {
  // Views navigation state
  const [currentView, setCurrentView] = useState<'catalog' | 'calculator' | 'quote'>('catalog');
  
  // Selected product for info modal
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  
  // Brand filtering in Catalog
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'artiq' | 'baristico'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Direct URL Copy Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // --- SYNC WITH URL HASH (DIRECT LINKING TO UNIVERSO ARTIQ / BARISTICO) ---
  useEffect(() => {
    const syncFromHash = (isInitial = false) => {
      const rawHash = window.location.hash.toLowerCase().replace('#', '').trim();
      if (!rawHash) {
        if (!isInitial) {
          setSelectedBrand('all');
          setCurrentView('catalog');
        }
        return;
      }

      if (['artiq', 'mundo-artiq', 'universo-artiq'].includes(rawHash)) {
        setCurrentView('catalog');
        setSelectedBrand('artiq');
        setSelectedCategory('all');
        document.title = 'Universo Artiq | Universo Horeca';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (['baristico', 'mundo-baristico', 'universo-baristico'].includes(rawHash)) {
        setCurrentView('catalog');
        setSelectedBrand('baristico');
        setSelectedCategory('all');
        document.title = 'Universo Barístico | Universo Horeca';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (['catalogo', 'todos', 'catalog', 'equipos'].includes(rawHash)) {
        setCurrentView('catalog');
        setSelectedBrand('all');
        document.title = 'Universo Horeca | Catálogo Profesional';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (['calculadora', 'simulador', 'calculator', 'roi'].includes(rawHash)) {
        setCurrentView('calculator');
        document.title = 'Simulador de Rentabilidad | Universo Horeca';
      } else if (['presupuesto', 'cotizacion', 'quote', 'carrito'].includes(rawHash)) {
        setCurrentView('quote');
        document.title = 'Solicitar Cotización | Universo Horeca';
      }
    };

    syncFromHash(true);

    const handleHashChange = () => syncFromHash(false);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToWorld = (brand: 'all' | 'artiq' | 'baristico', shouldScroll = true) => {
    setCurrentView('catalog');
    setSelectedBrand(brand);
    setSelectedCategory('all');

    const newHash = brand === 'all' ? 'catalogo' : brand;
    if (window.location.hash.replace('#', '').toLowerCase() !== newHash) {
      window.history.pushState(null, '', `#${newHash}`);
    }

    if (brand === 'artiq') {
      document.title = 'Universo Artiq | Universo Horeca';
    } else if (brand === 'baristico') {
      document.title = 'Universo Barístico | Universo Horeca';
    } else {
      document.title = 'Universo Horeca | Catálogo Profesional';
    }

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Botón "Solicitar Cotización" de la ficha: agrega el equipo (sin duplicarlo),
  // cierra la ficha y lleva a la pestaña de cotización, mostrando el formulario.
  // Botón "Cotizar" de las tarjetas: agrega el equipo (sin duplicarlo) y pregunta
  // si quiere seguir agregando productos o solicitar la cotización.
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const handleCardQuote = (productId: string) => {
    if (!quoteItems.some(item => item.productId === productId)) {
      handleAddToQuote(productId, 'purchase');
    }
    setJustAddedId(productId);
  };
  const closeAddedDialog = React.useCallback(() => setJustAddedId(null), []);
  const goToQuoteForm = () => {
    setJustAddedId(null);
    navigateToView('quote');
    window.setTimeout(() => {
      if (window.innerWidth < 1024) {
        document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  };

  const handleRequestQuote = (productId: string) => {
    if (!quoteItems.some(item => item.productId === productId)) {
      handleAddToQuote(productId, 'purchase');
    }
    setSelectedDetailProduct(null);
    navigateToView('quote');
    window.setTimeout(() => {
      if (window.innerWidth < 1024) {
        document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  };

  const navigateToView = (view: 'catalog' | 'calculator' | 'quote') => {
    setCurrentView(view);
    const hash = view === 'catalog' 
      ? (selectedBrand === 'all' ? 'catalogo' : selectedBrand) 
      : (view === 'calculator' ? 'simulador' : 'presupuesto');
    window.history.pushState(null, '', `#${hash}`);
    if (view === 'calculator') {
      document.title = 'Simulador de Rentabilidad | Universo Horeca';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'quote') {
      document.title = 'Solicitar Cotización | Universo Horeca';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyDirectUrl = (hash: string, universeName: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setToastMessage(`¡Enlace copiado! ${url}`);
        setTimeout(() => setToastMessage(null), 3500);
      }).catch(() => {
        prompt(`Copia el enlace directo para ${universeName}:`, url);
      });
    } else {
      prompt(`Copia el enlace directo para ${universeName}:`, url);
    }
  };

  const scrollToCatalogCategory = (brand: 'all' | 'artiq' | 'baristico') => {
    navigateToWorld(brand, true);
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
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigateToWorld('all', false)}>
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
            <nav className="hidden md:flex items-center space-x-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60 shadow-xs">
              <a
                href="#catalogo"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToWorld('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'catalog' && selectedBrand === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                Catálogo General
              </a>

              <a
                href="#artiq"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToWorld('artiq');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'catalog' && selectedBrand === 'artiq'
                    ? 'bg-artiq-500 text-white shadow-sm'
                    : 'text-artiq-700 hover:text-artiq-900 hover:bg-artiq-50'
                }`}
                title="Ir a Universo Artiq"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Mundo Artiq</span>
              </a>

              <a
                href="#baristico"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToWorld('baristico');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'catalog' && selectedBrand === 'baristico'
                    ? 'bg-[#5b4638] text-[#f4f1e4] shadow-sm'
                    : 'text-[#5b4638] hover:bg-[#f4f1e4]'
                }`}
                title="Ir a Universo Barístico"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Mundo Barístico</span>
              </a>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              <a
                href="#simulador"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToView('calculator');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'calculator' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulador ROI</span>
              </a>
            </nav>

            {/* Right-aligned interactions (Active cart badge / Contact details) */}
            <div className="flex items-center gap-3">
              <a
                href="#presupuesto"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToView('quote');
                }}
                className={`relative p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  currentView === 'quote' 
                    ? 'border-gray-900 bg-gray-50 text-gray-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title="Solicitar cotización"
                aria-label="Solicitar cotización"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="hidden sm:inline text-xs font-bold">Solicitar Cotización</span>
                {quoteItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {quoteItems.length}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FLOATING HEADER NAV (For small touchscreens: World / Brand selector) */}
      <div className="md:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-2 py-2 shadow-xs">
        <div className="flex items-center justify-center p-1 bg-gray-100/90 rounded-2xl max-w-sm mx-auto shadow-inner gap-1">
          <a
            href="#catalogo"
            onClick={(e) => {
              e.preventDefault();
              navigateToWorld('all');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              currentView === 'catalog' && selectedBrand === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Todos
          </a>
          <a
            href="#artiq"
            onClick={(e) => {
              e.preventDefault();
              navigateToWorld('artiq');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              currentView === 'catalog' && selectedBrand === 'artiq'
                ? 'bg-artiq-500 text-white shadow-sm'
                : 'text-artiq-700 hover:text-artiq-900'
            }`}
          >
            <img
              src={currentView === 'catalog' && selectedBrand === 'artiq'
                ? 'https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-1.svg'
                : 'https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-2.svg'}
              alt=""
              aria-hidden="true"
              className="w-4 h-4 shrink-0 object-contain"
              referrerPolicy="no-referrer"
            />
            <span>Artiq</span>
          </a>
          <a
            href="#baristico"
            onClick={(e) => {
              e.preventDefault();
              navigateToWorld('baristico');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              currentView === 'catalog' && selectedBrand === 'baristico'
                ? 'bg-[#5b4638] text-[#f4f1e4] shadow-sm'
                : 'text-[#5b4638] hover:text-[#3b2c23]'
            }`}
          >
            <img
              src={currentView === 'catalog' && selectedBrand === 'baristico'
                ? 'https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.1.svg'
                : 'https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.svg'}
              alt=""
              aria-hidden="true"
              className="w-4 h-4 shrink-0 object-contain"
              referrerPolicy="no-referrer"
            />
            <span>Barístico</span>
          </a>
        </div>
      </div>

      {/* HERO BANNER - Exact height of the image */}
      {currentView === 'catalog' && (
        <section className="relative w-full overflow-hidden bg-[#ece8e2]">
          {/* Image defining the exact natural height */}
          <picture className="block w-full">
            {/* Mobile (max-width: 767px): Banner changes apply ONLY to mobile */}
            <source
              media="(max-width: 767px)"
              srcSet={
                selectedBrand === 'artiq'
                  ? "https://artiq.com.co/wp-content/uploads/2026/10/Mundo-artiq-1.webp"
                  : selectedBrand === 'baristico'
                    ? "https://artiq.com.co/wp-content/uploads/2026/10/Mundo-baristico-2-1.webp"
                    : "https://artiq.com.co/wp-content/uploads/2026/10/horeca-profesional-dos-mundos-cl-1.webp"
              }
            />
            {/* Desktop (min-width: 768px) */}
            <source
              media="(min-width: 768px)"
              srcSet={
                selectedBrand === 'artiq'
                  ? "https://artiq.com.co/wp-content/uploads/2026/10/dosmundos-02-1.webp"
                  : selectedBrand === 'baristico'
                    ? "https://artiq.com.co/wp-content/uploads/2026/10/dosmundos-01-1.webp"
                    : "https://artiq.com.co/wp-content/uploads/2026/10/horeca-profesional-dos-mundos-mh-1.webp"
              }
            />
            <img 
              src={
                selectedBrand === 'artiq'
                  ? "https://artiq.com.co/wp-content/uploads/2026/10/dosmundos-02-1.webp"
                  : selectedBrand === 'baristico'
                    ? "https://artiq.com.co/wp-content/uploads/2026/10/dosmundos-01-1.webp"
                    : "https://artiq.com.co/wp-content/uploads/2026/10/horeca-profesional-dos-mundos-mh-1.webp"
              } 
              alt={
                selectedBrand === 'artiq'
                  ? "Mundo Artiq - Refrigeración Profesional"
                  : selectedBrand === 'baristico'
                    ? "Mundo Barístico - Ingeniería para Café"
                    : "Horeca Profesional - Maquinaria y Equipamiento Hostelero"
              } 
              className="w-full h-auto block"
              referrerPolicy="no-referrer"
            />
          </picture>

          {/* Text of the First Section on Top of Banner:
              Desktop and Mobile: Shown when all/general brand is selected.
              Hidden when selectedBrand === 'artiq' or selectedBrand === 'baristico' (as they have dedicated graphic titles and machinery).
          */}
          <div className={`absolute inset-0 z-10 flex-col items-center justify-center text-center animate-fadeIn px-2 sm:px-4 pointer-events-none ${
            selectedBrand === 'artiq' || selectedBrand === 'baristico' ? 'hidden' : 'flex'
          }`}>
            <div className="max-w-5xl mx-auto space-y-2 sm:space-y-2.5 flex flex-col items-center px-2">
              {/* Main Headline (split in two lines, second line larger) */}
              <h1 className="flex flex-col items-center text-[#221813] uppercase drop-shadow-sm text-center leading-tight">
                <span className="text-lg min-[360px]:text-xl min-[414px]:text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight whitespace-nowrap">
                  DOS MUNDOS,
                </span>
                <span className="text-2xl min-[360px]:text-3xl min-[414px]:text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight whitespace-nowrap mt-1">
                  UNA EXPERIENCIA.
                </span>
              </h1>

              {/* Subtitle with matching typographic contrast */}
              <div className="text-[11px] min-[360px]:text-xs min-[414px]:text-sm sm:text-xs md:text-base lg:text-xl text-[#221813] uppercase tracking-wider leading-relaxed font-semibold max-w-3xl drop-shadow-xs">
                <p>
                  NUEVO DESTINO PARA NEGOCIOS <span className="font-black">GASTRONÓMICOS,</span>
                </p>
                <p>
                  <span className="font-black">DE CAFÉ Y REFRIGERACIÓN</span> PROFESIONAL.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* VIEW 1: CATALOGUE AND DUAL WORLD SPLIT VIEW */}
        {currentView === 'catalog' && (
          <div className="space-y-10 animate-fadeIn">

            {/* DUAL MUNDOS PANEL (Split visual selector) */}
            {selectedBrand !== 'all' ? (
              <WorldCategoryBar
                world={selectedBrand}
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => {
                  setSelectedCategory(category);
                  document.getElementById('mobile-catalog-sliders')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ) : (
            <div className={`grid-cols-1 md:grid-cols-2 gap-6 pt-2 hidden md:grid`} id="mundos-horeca">
              
              {/* BRAND CARD: ARTIQ */}
              <div 
                id="mundo-artiq-card"
                onClick={() => navigateToWorld('artiq')}
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
                
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="bg-artiq-500 text-white p-2.5 rounded-2xl shadow-md flex items-center justify-center w-12 h-12">
                    <img 
                      src="https://artiq.com.co/wp-content/uploads/2026/08/isotipo-artiq-1.svg" 
                      alt="Artiq Isotipo" 
                      className="w-7 h-7 object-contain animate-pulse"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-artiq-600 bg-artiq-50 px-2.5 py-1 rounded-full uppercase border border-artiq-200/50">
                      Mundo Artiq
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyDirectUrl('artiq', 'Universo Artiq');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-artiq-700 bg-white/95 hover:bg-artiq-100 border border-artiq-200 px-2.5 py-1 rounded-xl transition-all shadow-2xs active:scale-95"
                      title="Copiar URL directa de Universo Artiq"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar URL</span>
                    </button>
                  </div>
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

                <div className="mt-6 flex items-center justify-between pt-2 border-t border-artiq-100/70">
                  <div className="flex items-center text-xs font-bold text-artiq-700 gap-1">
                    <span>Filtrar catálogo por Universo Artiq</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* BRAND CARD: BARISTICO */}
              <div 
                id="mundo-baristico-card"
                onClick={() => navigateToWorld('baristico')}
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

                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="bg-[#5b4638] text-[#f4f1e4] p-2.5 rounded-2xl shadow-md flex items-center justify-center w-12 h-12">
                    <img 
                      src="https://distritocafetero.com/wp-content/uploads/2026/08/Isotipo-baristico.1.svg" 
                      alt="Barístico Isotipo" 
                      className="w-7 h-7 object-contain animate-pulse"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-[#5b4638] bg-[#e8e0d4] px-2.5 py-1 rounded-full uppercase border border-[#8b5e3c]/20">
                      Mundo Barístico
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyDirectUrl('baristico', 'Universo Barístico');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5b4638] bg-white/95 hover:bg-[#e8e0d4] border border-[#8b5e3c]/30 px-2.5 py-1 rounded-xl transition-all shadow-2xs active:scale-95"
                      title="Copiar URL directa de Universo Barístico"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar URL</span>
                    </button>
                  </div>
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

                <div className="mt-6 flex items-center justify-between pt-2 border-t border-[#8b5e3c]/20">
                  <div className="flex items-center text-xs font-bold text-[#8b5e3c] gap-1">
                    <span>Filtrar catálogo por Universo Barístico</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
            )}

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
                  <span className="text-[11px] font-medium text-gray-500">Catálogo Oficial</span>
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
                        onAddToQuote={handleCardQuote}
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
      {/* Pop up de cotización (aparece una vez por visita) */}
      <QuotePopup suppressed={currentView === 'quote' || Boolean(selectedDetailProduct) || Boolean(justAddedId)} />

      {/* Aviso al tocar "Cotizar" en una tarjeta */}
      <AddedToQuoteDialog
        product={justAddedId ? PRODUCTS.find(p => p.id === justAddedId) ?? null : null}
        itemsCount={quoteItems.length}
        onKeepShopping={closeAddedDialog}
        onRequestQuote={goToQuoteForm}
      />

      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={Boolean(selectedDetailProduct)}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToQuote={handleAddToQuote}
        onRequestQuote={handleRequestQuote}
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
            <a href="#artiq" onClick={(e) => { e.preventDefault(); navigateToWorld('artiq'); }} className="hover:text-sky-600 transition-colors">
              Maquinaria Artiq
            </a>
            <a href="#baristico" onClick={(e) => { e.preventDefault(); navigateToWorld('baristico'); }} className="hover:text-amber-800 transition-colors">
              Equipamiento Barístico
            </a>
            <a href="#simulador" onClick={(e) => { e.preventDefault(); navigateToView('calculator'); }} className="hover:text-gray-800 transition-colors">
              Simulador Financiero
            </a>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] text-gray-500 font-medium pt-4 border-t border-gray-100">
            <a
              href="https://artiq.com.co/politica-privacidad/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-gray-300 hover:text-gray-800 hover:decoration-gray-500 transition-colors"
            >
              Política de privacidad y tratamiento de datos personales
            </a>
            <span className="hidden sm:inline text-gray-300" aria-hidden="true">|</span>
            <a
              href="https://artiq.com.co/politica-devoluciones-garantias/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-gray-300 hover:text-gray-800 hover:decoration-gray-500 transition-colors"
            >
              Política de devoluciones y garantías
            </a>
          </div>
          <p className="text-[10px]">
            &copy; {new Date().getFullYear()} Horeca profesional. Todos los derechos reservados. Las estimaciones son orientativas y se calculan basándose en costes medios del sector en Colombia.
          </p>
        </div>
      </footer>

      {/* Floating Toast Notification for Direct Link Sharing */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-950/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-medium">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
