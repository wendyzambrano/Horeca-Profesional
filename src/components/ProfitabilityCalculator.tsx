import React, { useState } from 'react';
import { PRODUCTS } from '../data';
import { Calculator, TrendingUp, DollarSign, PieChart, Info, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ProfitabilityCalculator() {
  const [activeTab, setActiveTab] = useState<'granizadora' | 'baristico' | 'hielo'>('granizadora');

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

  // ARTIQ States (Granizadoras only)
  const artiqProducts = PRODUCTS.filter(p => p.brand === 'artiq' && p.category === 'granizadora');
  const [selectedArtiqId, setSelectedArtiqId] = useState(artiqProducts[0]?.id || 'artiq-gran-2');
  const [artiqDailySales, setArtiqDailySales] = useState(40); // vasos al día
  const [artiqPricePerCup, setArtiqPricePerCup] = useState(6000); // COP por vaso
  const [artiqCostPerCup, setArtiqCostPerCup] = useState(800); // COP coste materia prima por vaso
  const [artiqDaysPerMonth, setArtiqDaysPerMonth] = useState(30);

  // BARISTICO States (including Carimali and Bellezza espresso machines)
  const baristicoProducts = PRODUCTS.filter(p => 
    (p.brand === 'baristico' || p.brand === 'carimali' || p.brand === 'bellezza') && 
    p.category === 'cafe'
  );
  const [selectedBarId, setSelectedBarId] = useState(baristicoProducts[0]?.id || '');
  const [barDailySales, setBarDailySales] = useState(120); // tazas al día
  const [barPricePerCup, setBarPricePerCup] = useState(5000); // COP por taza
  const [barCostPerCup, setBarCostPerCup] = useState(600); // COP café grano + leche + azúcar
  const [barDaysPerMonth, setBarDaysPerMonth] = useState(26);

  // ICE MACHINE States (New dedicated simulator)
  const iceProducts = PRODUCTS.filter(p => p.brand === 'artiq' && p.category === 'hielo');
  const [selectedIceId, setSelectedIceId] = useState(iceProducts[0]?.id || 'artiq-ice-110');
  const [iceDailyBags, setIceDailyBags] = useState(25); // bolsas al día
  const [iceBagWeight] = useState(10); // peso de bolsa fijo en 10kg
  const [iceExternalPricePerBag, setIceExternalPricePerBag] = useState(8000); // costo compra externa COP por bolsa de 10kg
  const [iceSelfCostPerBag, setIceSelfCostPerBag] = useState(1200); // costo producción propia (agua+luz) COP por bolsa de 10kg
  const [iceSellingPricePerBag, setIceSellingPricePerBag] = useState(9000); // precio de venta COP por bolsa de 10kg
  const [iceDaysPerMonth, setIceDaysPerMonth] = useState(30);
  const [icePurpose, setIcePurpose] = useState<'saving' | 'selling'>('saving');

  // Math calculations for ARTIQ
  const currentArtiqProduct = PRODUCTS.find(p => p.id === selectedArtiqId);
  const artiqPurchasePrice = currentArtiqProduct?.price || 5099000;

  const artiqMonthlyRevenue = artiqDailySales * artiqPricePerCup * artiqDaysPerMonth;
  const artiqMonthlyCost = artiqDailySales * artiqCostPerCup * artiqDaysPerMonth;
  const artiqNetProfit = Math.max(0, artiqMonthlyRevenue - artiqMonthlyCost);
  const artiqMarginPercent = artiqPricePerCup > 0 ? ((artiqPricePerCup - artiqCostPerCup) / artiqPricePerCup) * 100 : 0;
  const artiqPaybackMonths = artiqNetProfit > 0 ? (artiqPurchasePrice / artiqNetProfit) : 99;

  // Math calculations for BARISTICO
  const currentBarProduct = PRODUCTS.find(p => p.id === selectedBarId);
  const barPurchasePrice = currentBarProduct?.price || 12800000;

  const barMonthlyRevenue = barDailySales * barPricePerCup * barDaysPerMonth;
  const barMonthlyCost = barDailySales * barCostPerCup * barDaysPerMonth;
  const barNetProfit = Math.max(0, barMonthlyRevenue - barMonthlyCost);
  const barMarginPercent = barPricePerCup > 0 ? ((barPricePerCup - barCostPerCup) / barPricePerCup) * 100 : 0;
  const barPaybackMonths = barNetProfit > 0 ? (barPurchasePrice / barNetProfit) : 99;

  // Math calculations for ICE
  const currentIceProduct = PRODUCTS.find(p => p.id === selectedIceId);
  const icePurchasePrice = currentIceProduct?.price || 41399900;

  const iceMonthlyExternalCost = iceDailyBags * iceExternalPricePerBag * iceDaysPerMonth;
  const iceMonthlyRevenue = iceDailyBags * iceSellingPricePerBag * iceDaysPerMonth;
  const iceMonthlySelfCost = iceDailyBags * iceSelfCostPerBag * iceDaysPerMonth;

  const iceNetProfit = icePurpose === 'saving' 
    ? Math.max(0, iceMonthlyExternalCost - iceMonthlySelfCost)
    : Math.max(0, iceMonthlyRevenue - iceMonthlySelfCost);

  const iceMarginPercent = icePurpose === 'saving'
    ? (iceExternalPricePerBag > 0 ? ((iceExternalPricePerBag - iceSelfCostPerBag) / iceExternalPricePerBag) * 100 : 0)
    : (iceSellingPricePerBag > 0 ? ((iceSellingPricePerBag - iceSelfCostPerBag) / iceSellingPricePerBag) * 100 : 0);

  const icePaybackMonths = iceNetProfit > 0 ? (icePurchasePrice / iceNetProfit) : 99;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden" id="horeca-calculator">
      {/* Header Banner */}
      <div className={`p-6 text-white ${
        activeTab === 'granizadora' 
          ? 'bg-gradient-to-r from-artiq-500 to-artiq-700' 
          : activeTab === 'hielo'
            ? 'bg-gradient-to-r from-artiq-600 via-artiq-700 to-artiq-800'
            : 'bg-gradient-to-r from-baristico-700 to-baristico-800'
      } transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold font-mono tracking-widest text-white/70 uppercase">Negocio Horeca</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Simulador de Rentabilidad & Margen</h2>
          </div>
        </div>
        <p className="text-sm text-white/80 mt-2 max-w-2xl leading-relaxed">
          Compara de forma transparente la viabilidad económica de tus inversiones. Calcula el beneficio neto mensual o el ahorro por auto-producción y proyecta el Retorno de Inversión (ROI) en Colombia.
        </p>

        {/* Tab Selector inside banner */}
        <div className="flex flex-wrap bg-white/10 rounded-xl p-1 mt-6 max-w-xl border border-white/5 backdrop-blur-sm gap-1 md:gap-0">
          <button
            type="button"
            className={`flex-1 min-w-[140px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'granizadora'
                ? 'bg-white text-artiq-800 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('granizadora')}
          >
            <span>GRANIZADOS & BEBIDAS</span>
            <span className="text-[9px] bg-artiq-100 text-artiq-700 px-1.5 py-0.5 rounded font-mono font-bold">Artiq</span>
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[140px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hielo'
                ? 'bg-white text-artiq-800 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('hielo')}
          >
            <span>MÁQUINAS DE HIELO</span>
            <span className="text-[9px] bg-artiq-100 text-artiq-700 px-1.5 py-0.5 rounded font-mono font-bold">Artiq</span>
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[140px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'baristico'
                ? 'bg-[#f4f1e4] text-[#5b4638] shadow-md font-black'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('baristico')}
          >
            <span>ESPRESSO & CAFÉ</span>
            <span className="text-[9px] bg-[#e8e0d4] text-[#5b4638] px-1.5 py-0.5 rounded font-mono font-bold">Barístico</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS PANEL */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest font-mono">
            Parámetros de tu Local
          </h3>

          {activeTab === 'granizadora' && (
            // --- ARTIQ FORM ---
            <div className="space-y-6">
              {/* Select Machine */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Modelo de Maquinaria
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {artiqProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedArtiqId(p.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedArtiqId === p.id
                          ? 'border-artiq-500 bg-artiq-50/50 ring-2 ring-artiq-100'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-artiq-700 uppercase">
                          {getCategoryLabel(p.category)}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-600">
                          ${p.price.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                      <span className="block text-sm font-bold text-gray-900 mt-1 leading-tight">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Daily Cups */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    2. Consumo Estimado Diario (Granizados)
                  </label>
                  <span className="text-lg font-extrabold text-artiq-500 font-mono font-bold">
                    {artiqDailySales} <span className="text-xs text-gray-500">vasos/día</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={artiqDailySales}
                  onChange={(e) => setArtiqDailySales(Number(e.target.value))}
                  className="w-full accent-artiq-500 h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>10 vasos</span>
                  <span>100 vasos (Moderado)</span>
                  <span>200 vasos (Alto)</span>
                </div>
              </div>

              {/* Double Sliders: Price & Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      3. Precio Venta Público (PVP)
                    </label>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      ${artiqPricePerCup.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="20000"
                    step="500"
                    value={artiqPricePerCup}
                    onChange={(e) => setArtiqPricePerCup(Number(e.target.value))}
                    className="w-full accent-artiq-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      4. Coste de Ingredientes
                    </label>
                    <span className="text-sm font-bold text-red-600 font-mono">
                      ${artiqCostPerCup.toLocaleString('es-CO')} COP <span className="text-[10px] text-gray-400 font-normal">/vaso</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="100"
                    value={artiqCostPerCup}
                    onChange={(e) => setArtiqCostPerCup(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Days Open */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Días de Operación al Mes
                  </span>
                  <span className="text-xs text-gray-500">Días que ofreces el servicio mensualmente</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="31"
                  value={artiqDaysPerMonth}
                  onChange={(e) => setArtiqDaysPerMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold font-mono text-gray-800 focus:outline-none focus:border-artiq-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'baristico' && (
            // --- BARISTICO FORM ---
            <div className="space-y-6">
              {/* Select Machine */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Modelo de Cafetera
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {baristicoProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedBarId(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedBarId === p.id
                          ? 'border-[#8b5e3c] bg-[#f4f1e4] ring-2 ring-[#8b5e3c]/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono font-bold text-[#5b4638] uppercase px-1 py-0.5 bg-[#e8e0d4] rounded">
                          {getCategoryLabel(p.category)}
                        </span>
                      </div>
                      <span className="block text-sm font-bold text-gray-900 leading-tight">
                        {p.name.replace('Barístico ', '')}
                      </span>
                      <span className="block text-[10px] font-mono font-bold text-gray-500 mt-2">
                        ${p.price.toLocaleString('es-CO')} COP
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Daily Cups */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    2. Servicios de Café Diarios
                  </label>
                  <span className="text-lg font-extrabold text-[#8b5e3c] font-mono font-bold">
                    {barDailySales} <span className="text-xs text-gray-500">tazas/día</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={barDailySales}
                  onChange={(e) => setBarDailySales(Number(e.target.value))}
                  className="w-full accent-[#8b5e3c] h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>20 cafés</span>
                  <span>150 cafés (Frecuente)</span>
                  <span>400 cafés (Gran volumen)</span>
                </div>
              </div>

              {/* Double Sliders: Price & Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      3. Precio Medio de Taza (PVP)
                    </label>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      ${barPricePerCup.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="15000"
                    step="500"
                    value={barPricePerCup}
                    onChange={(e) => setBarPricePerCup(Number(e.target.value))}
                    className="w-full accent-[#8b5e3c] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      4. Coste Grano + Leche + Extras
                    </label>
                    <span className="text-sm font-bold text-red-600 font-mono">
                      ${barCostPerCup.toLocaleString('es-CO')} COP <span className="text-[10px] text-gray-400 font-normal">/taza</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={barCostPerCup}
                    onChange={(e) => setBarCostPerCup(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Days Open */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Días de Apertura al Mes
                  </span>
                  <span className="text-xs text-gray-500">Habitualmente 26 días (6 días por semana)</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="31"
                  value={barDaysPerMonth}
                  onChange={(e) => setBarDaysPerMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold font-mono text-gray-800 focus:outline-none focus:border-baristico-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'hielo' && (
            // --- HIELO FORM (ARTIQ) ---
            <div className="space-y-6">
              {/* Select Machine */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Modelo de Productora de Hielo Artiq
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {iceProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedIceId(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedIceId === p.id
                          ? 'border-artiq-500 bg-artiq-50/50 ring-2 ring-artiq-100 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono font-bold text-artiq-700 uppercase px-1.5 py-0.5 bg-artiq-100 rounded">
                          {p.name.includes('Escamas') ? 'Escamas' : 'Cubos'}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-artiq-600">Artiq</span>
                      </div>
                      <span className="block text-xs font-bold text-gray-900 leading-tight">
                        {p.name.replace('Máquina de ', '')}
                      </span>
                      <span className="block text-[10px] font-mono font-bold text-gray-500 mt-2">
                        ${p.price.toLocaleString('es-CO')} COP
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Propósito */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  2. Propósito de la Producción de Hielo
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIcePurpose('saving')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      icePurpose === 'saving'
                        ? 'bg-white text-artiq-800 shadow-sm font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Autoconsumo (Ahorro)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIcePurpose('selling')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      icePurpose === 'selling'
                        ? 'bg-white text-artiq-800 shadow-sm font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Venta Comercial
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                  {icePurpose === 'saving' 
                    ? 'Calcula el dinero que ahorras al fabricar tu propio hielo internamente en vez de comprar bolsas a un distribuidor o proveedor externo.'
                    : 'Calcula las ganancias brutas y netas si decides embolsar el hielo (unidades de 10 kg) y venderlas directamente al público.'}
                </p>
              </div>

              {/* Slider Daily Bags */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    3. Bolsas de Hielo Diarias (10 kg c/u)
                  </label>
                  <span className="text-lg font-extrabold text-artiq-500 font-mono font-bold">
                    {iceDailyBags} <span className="text-xs text-gray-500">bolsas/día ({iceDailyBags * iceBagWeight} kg)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={iceDailyBags}
                  onChange={(e) => setIceDailyBags(Number(e.target.value))}
                  className="w-full accent-artiq-500 h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>5 bolsas (50 kg)</span>
                  <span>75 bolsas (750 kg)</span>
                  <span>150 bolsas (1500 kg)</span>
                </div>
              </div>

              {/* Cost/Price Inputs depending on purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {icePurpose === 'saving' ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        4. Costo Compra Externa (Bolsa 10kg)
                      </label>
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        ${iceExternalPricePerBag.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="20000"
                      step="500"
                      value={iceExternalPricePerBag}
                      onChange={(e) => setIceExternalPricePerBag(Number(e.target.value))}
                      className="w-full accent-artiq-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        4. Precio de Venta (Bolsa 10kg)
                      </label>
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        ${iceSellingPricePerBag.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4000"
                      max="25000"
                      step="500"
                      value={iceSellingPricePerBag}
                      onChange={(e) => setIceSellingPricePerBag(Number(e.target.value))}
                      className="w-full accent-artiq-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      5. Costo de Auto-producción
                    </label>
                    <span className="text-sm font-bold text-red-600 font-mono">
                      ${iceSelfCostPerBag.toLocaleString('es-CO')} COP <span className="text-[10px] text-gray-400 font-normal">/bolsa</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4000"
                    step="100"
                    value={iceSelfCostPerBag}
                    onChange={(e) => setIceSelfCostPerBag(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-gray-400 block mt-0.5">
                    Estimación de agua + luz por cada 10 kg producidos.
                  </span>
                </div>
              </div>

              {/* Days Open */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Días de Operación al Mes
                  </span>
                  <span className="text-xs text-gray-500">Días al mes que produces/consumes hielo</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="31"
                  value={iceDaysPerMonth}
                  onChange={(e) => setIceDaysPerMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold font-mono text-gray-800 focus:outline-none focus:border-artiq-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${
                activeTab === 'granizadora' || activeTab === 'hielo'
                  ? 'text-artiq-500' 
                  : 'text-[#8b5e3c]'
              }`} />
              Resultados Económicos Mensuales
            </h3>

            {/* Profits Large Callout */}
            <div className={`p-5 rounded-2xl text-center shadow-inner relative overflow-hidden ${
              activeTab === 'granizadora' || activeTab === 'hielo'
                ? 'bg-artiq-800 text-white' 
                : 'bg-[#1c1c1c] text-[#f4f1e4] border border-[#5b4638]'
            }`}>
              <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5">
                <DollarSign className="w-32 h-32 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/65 block font-mono">
                {activeTab === 'hielo' && icePurpose === 'saving' ? 'AHORRO NETO ESTIMADO' : 'BENEFICIO NETO ESTIMADO'}
              </span>
              <span className="text-3xl font-extrabold tracking-tight block my-1 font-mono">
                ${(
                  activeTab === 'granizadora' 
                    ? artiqNetProfit 
                    : activeTab === 'hielo'
                      ? iceNetProfit
                      : barNetProfit
                ).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-white/75"> COP / mes</span>
              </span>
              <p className="text-xs text-white/70">
                {activeTab === 'hielo' 
                  ? icePurpose === 'saving'
                    ? 'Al fabricar tu propio hielo en vez de comprarlo externamente (excluye luz, agua y nómina calculados aparte).'
                    : 'Tras descontar el costo estimado de energía y agua por bolsa (no se incluyen gastos generales ni de empleados).'
                  : 'Tras descontar el costo estimado de los insumos (no se incluyen gastos de luz, agua, ni pago a empleados).'
                }
              </p>
            </div>

            {/* Metric Rows */}
            <div className="mt-6 space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium">
                  {activeTab === 'hielo' && icePurpose === 'saving' ? 'Gasto Compras Externas Evitado:' : 'Ingresos Brutos:'}
                </span>
                <span className="font-bold text-gray-900 font-mono text-emerald-600">
                  +${(
                    activeTab === 'granizadora' 
                      ? artiqMonthlyRevenue 
                      : activeTab === 'hielo'
                        ? (icePurpose === 'saving' ? iceMonthlyExternalCost : iceMonthlyRevenue)
                        : barMonthlyRevenue
                  ).toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium">
                  {activeTab === 'hielo' ? 'Costo de Auto-producción:' : 'Coste de Producto:'}
                </span>
                <span className="font-semibold text-red-600 font-mono">
                  -${(
                    activeTab === 'granizadora' 
                      ? artiqMonthlyCost 
                      : activeTab === 'hielo'
                        ? iceMonthlySelfCost
                        : barMonthlyCost
                  ).toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP
                </span>
              </div>

              {/* Gross Margin bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">
                    {activeTab === 'hielo' && icePurpose === 'saving' ? 'Porcentaje de Ahorro:' : 'Margen Comercial Bruto:'}
                  </span>
                  <span className={`font-bold ${
                    activeTab === 'granizadora' || activeTab === 'hielo'
                      ? 'text-artiq-700' 
                      : 'text-[#5b4638]'
                  }`}>
                    {(
                      activeTab === 'granizadora' 
                        ? artiqMarginPercent 
                        : activeTab === 'hielo'
                          ? iceMarginPercent
                          : barMarginPercent
                    ).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activeTab === 'granizadora' || activeTab === 'hielo'
                        ? 'bg-artiq-500' 
                        : 'bg-[#8b5e3c]'
                    }`}
                    style={{ width: `${
                      activeTab === 'granizadora' 
                        ? artiqMarginPercent 
                        : activeTab === 'hielo'
                          ? iceMarginPercent
                          : barMarginPercent
                    }%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payback period notice */}
          <div className="mt-6 bg-white p-4 rounded-xl border border-gray-100 text-xs text-gray-600 flex gap-2.5 items-start">
            <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
              activeTab === 'granizadora' || activeTab === 'hielo'
                ? 'text-artiq-500' 
                : 'text-[#8b5e3c]'
            }`} />
            <div>
              <span className="font-bold text-gray-900 block">Retorno de Inversión (ROI):</span>
              <p className="mt-0.5 text-gray-500">
                Al adquirir el equipo por{' '}
                <span className="font-semibold">
                  ${(
                    activeTab === 'granizadora' 
                      ? artiqPurchasePrice 
                      : activeTab === 'hielo'
                        ? icePurchasePrice
                        : barPurchasePrice
                  ).toLocaleString('es-CO')} COP
                </span>
                , recuperarás el 100% de la inversión inicial en aproximadamente{' '}
                <span className="font-bold text-gray-800">
                  {(
                    activeTab === 'granizadora' 
                      ? artiqPaybackMonths 
                      : activeTab === 'hielo'
                        ? icePaybackMonths
                        : barPaybackMonths
                  ).toFixed(1)} meses
                </span>{' '}
                gracias al {activeTab === 'hielo' && icePurpose === 'saving' ? 'ahorro' : 'margen'} neto obtenido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

