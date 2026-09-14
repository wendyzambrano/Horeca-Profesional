import { Product, Inquiry, PublicNeed } from './types';

export const PRODUCTS: Product[] = [
  // --- MUNDO ARTIQ (Frío y dispensación) ---
  {
    id: 'artiq-disp-3t-aspas',
    brand: 'artiq',
    category: 'dispensador',
    name: 'Maquina dispensadora de bebidas 3 tanques con aspas',
    description: 'Dispensadora de bebidas profesional refrigerada de 3 tanques con sistema de aspas giratorias (Referencia: MAQ050403-007). Equipada con 3 depósitos independientes de 15 litros cada uno (45 litros de capacidad total), compresor Wanbao de alto rendimiento, estructura en acero inoxidable 303 y refrigerante ecológico R290. Diseñada para pulverizar, mezclar y refrigerar bebidas continuas entre 7°C y 12°C.',
    price: 3549900,
    image: 'https://artiq.com.co/wp-content/uploads/2026/09/dispensador-de-aspas-3T-lateral-3-4.webp',
    specs: [
      'Referencia: MAQ050403-007',
      'Número de tanques: 3 Unidades independientes',
      'Capacidad por tanque: 15 Litros (Capacidad total: 45 Litros)',
      'Sistema: Aspas giratorias continuas',
      'Control: Pulveriza, mezcla y refrigera',
      'Compresor: Wanbao de alta eficiencia',
      'Voltaje: 110 V / 60 Hz',
      'Potencia: 320 W',
      'Refrigerante: R290 (80g) ecológico',
      'Temperatura de las bebidas: Entre 7°C y 12°C',
      'Dimensiones (Al x An x L): 69 cm x 41 cm x 60 cm',
      'Peso neto: 33 Kg',
      'Color: Gris',
      'Estructura: Acero inoxidable 303',
      'Tanques: Fabricado en policarbonato de alta resistencia',
      'Características: Bandeja antiderrames, botones mecánicos y disipador de aire',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: '3 Tanques de 15L', value: 'Depósitos independientes de policarbonato para 45L en total' },
      { label: 'Sistema con Aspas', value: 'Aspas giratorias para mezcla uniforme y textura homogénea' },
      { label: 'Acero Inox 303', value: 'Chasis robusto en acero inoxidable 303 de máxima durabilidad' },
      { label: 'Control Frío 7°C - 12°C', value: 'Refrigeración continua y eficiente impulsada por compresor Wanbao' },
      { label: 'Botones Mecánicos', value: 'Bandeja antiderrames desmontable y disipador de aire optimizado' },
      { label: 'Garantía Oficial', value: '15 meses de garantía por defectos de fábrica' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-disp-2t-aspas',
    brand: 'artiq',
    category: 'dispensador',
    name: 'Dispensador de Jugo 2 tanques con Aspas',
    description: 'Dispensadora de bebidas profesional refrigerada de 2 tanques con sistema de aspas giratorias (Referencia: MAQ0089). Cuenta con 2 depósitos de policarbonato de 18 litros cada uno (36 litros de capacidad total), compresor Embraco de alto desempeño, estructura en acero inoxidable 303 y refrigerante R290. Especialmente formulada y recomendada para bebidas a base de leche, jugos y néctares continuos entre 7°C y 12°C.',
    price: 3149900,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/MAQ0089-DISPENSADOR-DE-JUGO-CON-ASPAS-2-6-1-2.webp',
    specs: [
      'Referencia: MAQ0089',
      'Número de tanques: 2 Unidades independientes',
      'Capacidad por tanque: 18 Litros (Capacidad total: 36 Litros)',
      'Sistema: Aspas giratorias continuas',
      'Control: Pulveriza, mezcla y refrigera',
      'Compresor: Embraco de alta eficiencia',
      'Voltaje: 110 V / 60 Hz',
      'Potencia: 280 W',
      'Refrigerante: R290 / 82 g ecológico',
      'Temperatura de las bebidas: Entre 7°C y 12°C',
      'Dimensiones (Al x An x L): 710 mm x 460 mm x 340 mm',
      'Peso neto: 29 Kg',
      'Color: Gris y negro',
      'Estructura: Acero inoxidable 303',
      'Tanques: Fabricados en policarbonato de alta resistencia',
      'Características: Bandeja antiderrames, switches, rejilla de aire y sistema corta gotera',
      'Observaciones: Especial para bebidas a base de leche',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: '2 Tanques de 18L', value: 'Depósitos independientes de policarbonato para 36L de capacidad' },
      { label: 'Compresor Embraco', value: 'Máximo rendimiento frigorífico continuo y alta durabilidad' },
      { label: 'Sistema con Aspas', value: 'Aspas giratorias para mezclar y refrigerar bebidas lácteas y jugos' },
      { label: 'Sistema Corta Gotera', value: 'Válvulas herméticas, bandeja antiderrames y rejilla de aire' },
      { label: 'Acero Inox 303', value: 'Chasis robusto en acero inoxidable 303 con acabado gris y negro' },
      { label: 'Garantía Oficial', value: '15 meses de garantía directa por defectos de fábrica' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-disp-3t-agitacion',
    brand: 'artiq',
    category: 'dispensador',
    name: 'Dispensador de Bebidas Frías 10 Litros x3 Tanques',
    description: 'Dispensadora de bebidas profesional refrigerada de 3 tanques con sistema de bomba de agitación (Referencia: MAQ0044). Cuenta con 3 depósitos de policarbonato de 10 litros cada uno (30 litros de capacidad total), compresor Zel de alto rendimiento, estructura en acero inoxidable 303 y refrigerante R134A. Diseñada para agitar y refrigerar bebidas entre 7°C y 12°C con funcionamiento silencioso, ahorro de energía y sistema corta gotera.',
    price: 3400000,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/BON6856.jpg',
    specs: [
      'Referencia: MAQ0044',
      'Número de tanques: 3 Unidades independientes',
      'Capacidad por tanque: 10 Litros (Capacidad total: 30 Litros)',
      'Sistema: Con bomba de agitación',
      'Control: Agita y refrigera',
      'Compresor: Zel de alto rendimiento',
      'Voltaje: 110 V / 60 Hz',
      'Potencia: 380 W',
      'Refrigerante: R134A',
      'Temperatura de las bebidas: Entre 7°C y 12°C',
      'Dimensiones (Al x An x L): 740 mm x 470 mm x 750 mm',
      'Peso neto: 40 Kg',
      'Color: Gris',
      'Estructura: Acero inoxidable 303',
      'Tanque: Fabricado en policarbonato de alta resistencia',
      'Características: Bandeja antiderrames, botones mecánicos y disipador de aire',
      'Funciones inteligentes: Ahorro de energía, sistema corta gotera, funcionamiento silencioso y control eficaz',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: '3 Tanques de 10L', value: 'Depósitos independientes de policarbonato para 30L de capacidad' },
      { label: 'Bomba de Agitación', value: 'Mantiene bebidas homogéneas y frías con agitación constante' },
      { label: 'Compresor Zel 380W', value: 'Potencia frigorífica confiable y de alta durabilidad comercial' },
      { label: 'Funciones Inteligentes', value: 'Ahorro de energía, bajo nivel de ruido y sistema corta gotera' },
      { label: 'Acero Inox 303', value: 'Chasis robusto en acero inoxidable 303 con bandeja antiderrames' },
      { label: 'Garantía Oficial', value: '15 meses de garantía directa por defectos de fábrica' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-disp-2t-agitacion',
    brand: 'artiq',
    category: 'dispensador',
    name: 'Dispensador de Bebidas Frías 10 litros x2 Tanques',
    description: 'Dispensadora de bebidas profesional refrigerada de 2 tanques con sistema de bomba de agitación (Referencia: MAQ0043). Equipada con 2 depósitos independientes de 10 litros de policarbonato (20 litros de capacidad total), compresor Zel de alta eficiencia, estructura en acero inoxidable 303 y refrigerante ecológico R134A. Diseñada para agitar y refrigerar bebidas entre 7°C y 12°C con funcionamiento ultra silencioso, ahorro de energía y sistema corta gotera.',
    price: 2700000,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/BON6891.jpg',
    specs: [
      'Referencia: MAQ0043',
      'Número de tanques: 2 Unidades independientes',
      'Capacidad por tanque: 10 Litros (Capacidad total: 20 Litros)',
      'Sistema: Con bomba de agitación',
      'Control: Agita y refrigera',
      'Compresor: Zel de alto rendimiento',
      'Voltaje: 110 V / 60 Hz',
      'Potencia: 280 W',
      'Refrigerante: R134A',
      'Temperatura de las bebidas: Entre 7°C y 12°C',
      'Dimensiones (Al x An x L): 740 mm x 470 mm x 510 mm',
      'Peso neto: 35 Kg',
      'Color: Gris',
      'Estructura: Acero inoxidable 303',
      'Tanque: Fabricado en policarbonato de alta resistencia',
      'Características: Bandeja antiderrames, botones mecánicos y disipador de aire',
      'Funciones inteligentes: Ahorro de energía, sistema corta gotera, funcionamiento silencioso y control eficaz',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: '2 Tanques de 10L', value: 'Depósitos independientes de policarbonato para 20L de capacidad total' },
      { label: 'Bomba de Agitación', value: 'Mantiene bebidas homogéneas y frías con agitación constante' },
      { label: 'Compresor Zel 280W', value: 'Rendimiento frigorífico continuo y alta eficiencia energética' },
      { label: 'Funciones Inteligentes', value: 'Ahorro de energía, bajo nivel sonoro y sistema corta gotera' },
      { label: 'Acero Inox 303', value: 'Chasis robusto en acero inoxidable 303 con bandeja antiderrames' },
      { label: 'Garantía Oficial', value: '15 meses de garantía directa por defectos de fábrica' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-gran-2',
    brand: 'artiq',
    category: 'granizadora',
    name: 'Máquina de Granizados Artiq 12 Litros',
    description: 'Máquina granizadora profesional con 1 depósito de 12 litros. Perfecta para locales comerciales, bares o cafeterías que quieren incorporar granizados premium optimizando el espacio en barra. Sistema de control electrónico inteligente de consistencia.',
    price: 5099000,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/maquina-granizado-un-tanque-compacta.webp',
    specs: [
      'Capacidad: 1 x 12 Litros',
      'Voltaje: 110V / 60Hz',
      'Potencia: 400W',
      'Gas refrigerante: R404A (90g)',
      'Dimensiones: 81 x 23 x 49 cm',
      'Peso neto: 57 Kg'
    ],
    features: [
      { label: 'Diseño Compacto', value: 'Optimiza espacio en barra' },
      { label: 'Luces LED', value: 'Retroiluminación atractiva del tanque' },
      { label: 'Modo Noche', value: 'Bajo consumo de mantenimiento' },
      { label: 'Limpieza Rápida', value: 'Grifo desmontable sin herramientas' }
    ],
    rating: 4.7
  },
  {
    id: 'artiq-gran-3',
    brand: 'artiq',
    category: 'granizadora',
    name: 'Máquina Granizadora Artiq 2 Tanques (24 Litros)',
    description: 'Máquina granizadora profesional con 2 depósitos de 12 litros cada uno (24L en total). Equipada con compresores independientes por tanque y sistema de control de densidad electrónico inteligente.',
    price: 6229000,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/Granizadora-2-Tanques-Profesional.webp',
    specs: [
      'Capacidad: 2 x 12 Litros (24L)',
      'Voltaje: 110V / 60Hz',
      'Potencia: 600W',
      'Gas refrigerante: R290 (Ecológico)',
      'Dimensiones: 81 x 41 x 49 cm',
      'Peso neto: 57 Kg'
    ],
    features: [
      { label: 'Doble Depósito', value: 'Control de densidad independiente' },
      { label: 'Congelación Rápida', value: 'Lista en menos de 45 minutos' },
      { label: 'Luces LED', value: 'Retroiluminación de alta visibilidad' },
      { label: 'Modo Noche', value: 'Mantiene frío con mínimo consumo' }
    ],
    rating: 4.8
  },
  {
    id: 'artiq-ice-45',
    brand: 'artiq',
    category: 'granizadora',
    name: 'Máquina Granizadora Artiq 12 Litros x 3 Tanques',
    description: 'La granizadora de máxima potencia y capacidad con 3 depósitos de 12 litros (36L en total). Ideal para negocios de alto tráfico, chiringuitos, terrazas y discotecas de gran afluencia.',
    price: 8839000,
    image: 'https://artiq.com.co/wp-content/uploads/2025/12/Granizadora-3-Tanques-Profesional-36-Litros.webp',
    specs: [
      'Capacidad: 3 x 12 Litros (36L)',
      'Voltaje: 110V / 60Hz',
      'Potencia: 700W',
      'Gas refrigerante: R404A (452g)',
      'Dimensiones: 81 x 60 x 49 cm',
      'Peso neto: 88 Kg'
    ],
    features: [
      { label: 'Triple Depósito', value: 'Regulación independiente de cada tanque' },
      { label: 'Doble Mezcla', value: 'Palas helicoidales antiobstrucción' },
      { label: 'Panel Digital', value: 'Ajuste fino de consistencia' },
      { label: 'Luces LED', value: 'Retroiluminación LED integrada' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-ice-455',
    brand: 'artiq',
    category: 'hielo',
    name: 'Máquina de Hielo Industrial 455 Kg',
    description: 'Fabricadora de hielo industrial en cubos de alta eficiencia (Referencia: MAQ080103-004). Produce hasta 455 kg de hielo en 24 horas con una tolva de almacenamiento integrada de hasta 315 kg. Equipada con potente compresor Shanghai Highly de 3000 W, condensador de tubo de cobre y aletas de aluminio, pantalla digital de diagnóstico, ciclo rápido de 13 a 20 minutos (380 cubos por ciclo de 22 mm), autolimpieza y modo de ahorro de energía.',
    price: 27976000,
    image: 'https://artiq.com.co/wp-content/uploads/2026/07/hilera-455kg-1.webp',
    specs: [
      'Referencia: MAQ080103-004',
      'Capacidad de producción: Hasta 455 Kg en 24 horas',
      'Capacidad de almacenamiento: Hasta 315 Kg',
      'Cantidad de hielos por ciclo: 380 unidades',
      'Tiempo del ciclo: 13 a 20 Minutos',
      'Forma de hielo: Cubo de 22 mm (cuadrado)',
      'Consumo de agua: 430 - 600 L (24 Horas)',
      'Compresor: Shanghai Highly de alto rendimiento',
      'Potencia: 3000 W | Corriente: 15.0 A',
      'Voltaje: 220V / 60 Hz',
      'Refrigerante: R404A (1200g)',
      'Suministro de agua: Automático (Tubería de 3/4" - Presión: 0.13 - 0.55 MPA)',
      'Desagüe: Sí',
      'Dimensiones (Al x An x Pr): 2057 mm x 1227 mm x 965 mm',
      'Peso neto: 177 Kg',
      'Estructura: Acero inoxidable y plástico de alta resistencia',
      'Condensador: Tubo de cobre + aleta de aluminio',
      'Sensores: Nivel de agua, temperatura y alerta de errores',
      'Funciones inteligentes: Limpieza automática (ciclo cada 3 días), pantalla digital, retraso programable hasta 24h y modo de espera automático',
      'Accesorios incluidos: Pala recolectora de hielo, filtro de agua, manguera, conector de plástico, junta, cinta de teflón y patas del contenedor',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: 'Producción 455 Kg / 24h', value: 'Hasta 455 kg diarios con tolva de reserva para 315 kg' },
      { label: '380 Cubos por Ciclo', value: 'Hielo en cubo de 22 mm cuadrado en ciclos de 13 a 20 min' },
      { label: 'Compresor Shanghai Highly', value: '3000 W de potencia frigorífica comercial confiable' },
      { label: 'Limpieza Automática', value: 'Ciclo asistido de lavado y pantalla digital con diagnóstico' },
      { label: 'Kit Completo Incluido', value: 'Filtro de agua, pala recolectora, mangueras y patas' },
      { label: 'Garantía Oficial', value: '15 meses de garantía directa por defectos de fábrica' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-ice-110',
    brand: 'artiq',
    category: 'hielo',
    name: 'Máquina de Hielo en Escamas 1500kg',
    description: 'Fabricadora de hielo industrial de alta eficiencia, genera hasta 1500 kg de hielo en escama en 24 horas. Equipada con compresor Copeland, sensores de nivel y estructura robusta de acero inoxidable.',
    price: 67499900,
    image: 'https://artiq.com.co/wp-content/uploads/2026/05/maquina-hielo-1500kg-escama.webp',
    specs: [
      'Producción diaria: Hasta 1500 Kg / 24 horas',
      'Capacidad de almacenamiento: Hasta 315 Kg',
      'Voltaje y Corriente: 220V / 60 Hz (Trifásica, 15.8 A)',
      'Compresor: Copeland de alta potencia (7400 W)',
      'Dimensiones (Al x An x Pr): 2160 x 1227 x 945 mm',
      'Refrigerante: R404A (2300g)',
      'Forma del hielo: Escama industrial',
      'Consumo de agua: 1280 - 1550 L (24 Horas)',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: 'Hielo en Escama', value: 'Fusión lenta ideal para conservación' },
      { label: 'Sensores Inteligentes', value: 'Nivel de agua, hielo lleno y temp. evaporador' },
      { label: 'Limpieza Automática', value: 'Ciclo sugerido cada 3 días' },
      { label: 'Panel de Control', value: 'Botones ON/OFF, indicadores y diagnósticos' }
    ],
    rating: 4.9
  },
  {
    id: 'artiq-disp-4',
    brand: 'artiq',
    category: 'hielo',
    name: 'Máquina de Hielo en Cubos 900kg',
    description: 'Fabricadora de hielo industrial en cubos de alta eficiencia. Genera hasta 900 kg de hielo en cubos de 22 mm en 24 horas. Equipada con compresor Shanghai Highly, estructura de acero inoxidable y funciones inteligentes.',
    price: 46800000,
    image: 'https://artiq.com.co/wp-content/uploads/2026/05/maquina-de-hielo-900kg-tapa-cerrada.webp',
    specs: [
      'Producción diaria: Hasta 900 Kg / 24 horas',
      'Capacidad de almacenamiento: Hasta 315 Kg',
      'Voltaje y Corriente: 220V / 60 Hz (Trifásica, 15.0 A)',
      'Compresor: Shanghai Highly de alta potencia (4700 W)',
      'Dimensiones (Al x An x Pr): 2057 x 1227 x 965 mm',
      'Refrigerante: R404A (1850g)',
      'Forma del hielo: Cubo de 22 mm (Cuadrado)',
      'Consumo de agua: 800 - 1110 L (24 Horas)',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: 'Cubo de Hielo', value: 'Cubo de 22 mm (Cuadrado)' },
      { label: 'Tiempo del Ciclo', value: '13 a 20 Minutos' },
      { label: 'Sensores Inteligentes', value: 'Nivel de agua, temperatura y alerta de errores' },
      { label: 'Limpieza Automática', value: 'Ciclo sugerido cada 3 días' },
      { label: 'Materiales Premium', value: 'Acero inoxidable y plástico de alta resistencia' }
    ],
    rating: 4.8
  },
  {
    id: 'artiq-disp-juice',
    brand: 'artiq',
    category: 'hielo',
    name: 'Máquina de Hielo en Escamas 800kg',
    description: 'Fabricadora de hielo industrial en escamas de alta eficiencia (Referencia: MAQ080103-015). Genera hasta 800 kg de hielo en 24 horas. Equipada con compresor Shanghai Highly, estructura de acero inoxidable, sensores inteligentes y funciones avanzadas.',
    price: 41399900,
    image: 'https://artiq.com.co/wp-content/uploads/2026/05/hielera-800kg-perfil.webp',
    specs: [
      'Producción diaria: Hasta 800 Kg / 24 horas',
      'Capacidad de almacenamiento: Hasta 200 Kg',
      'Voltaje y Corriente: 220v / 60 Hz (Monofásica, 13.0 A)',
      'Compresor: Shanghai Highly de alta potencia (3450 W)',
      'Dimensiones (Al x An x Pr): 1990 x 760 x 860 mm',
      'Refrigerante: R404A (1500g)',
      'Forma del hielo: Escama',
      'Garantía: 15 Meses por defectos de fábrica'
    ],
    features: [
      { label: 'Estructura Premium', value: 'Acero Inoxidable y plástico de alta resistencia' },
      { label: 'Sensores Inteligentes', value: 'Nivel de agua, hielo lleno, temporizador, temperatura y errores' },
      { label: 'Funciones Inteligentes', value: 'Limpieza automática, retraso programable (hasta 24h) y modo de espera' },
      { label: 'Accesorios Incluidos', value: 'Pala recolectora, filtro de agua, mangueras y patas del contenedor' },
      { label: 'Panel de Control', value: 'Botones ON/OFF y ciclo de limpieza' }
    ],
    rating: 4.8
  },

  // --- MUNDO BARÍSTICO (Café y molienda) ---
  {
    id: 'bar-bravetto-barista-master',
    brand: 'baristico',
    category: 'cafe',
    name: 'Máquina de Espresso Barista Máster',
    description: 'Máquina de espresso semi-profesional de alta precisión Bravetto Barista Máster (Referencia: MAQ090405-001). Equipada con bomba italiana ULKA de 19 bares con manómetro integrado, sistema de calentamiento por termobloque de 1600 W, portafiltro profesional de 58 mm y molino integrado con muelas de acero y 214° de ajuste. Incorpora gramera digital integrada, control de temperatura PID (90°C a 96°C), lanceta de vapor en 3 niveles, preinfusión y función de agua caliente integrada.',
    price: 2799900,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/09/Maquina-espresso-01.webp',
    specs: [
      'Referencia: MAQ090405-001',
      'Marca: Bravetto (Quality Origin)',
      'Capacidad: 1 grupo | Tolva: 210 gr | Tanque de agua: 2.8 litros',
      'Bomba: ULKA de 19 bares de presión con manómetro integrado',
      'Sistema térmico: Termobloque de rápido precalentamiento',
      'Potencia y Conexión: 1600 W | 110 V / 60 Hz',
      'Molino integrado: Ajuste de 214° con muelas en acero de alta resistencia',
      'Tiempo de molienda: 5 a 20 segundos configurables',
      'Portafiltro: Profesional de 58 mm (incluye dos filtros)',
      'Control de temperatura: 90° C - 96° C',
      'Preinfusión: Hasta 90 segundos',
      'Opciones de preparación: Espresso, Doble espresso y Manual',
      'Panel de control: Pantalla digital con gramera integrada',
      'Lanceta de vapor: Ajuste de vapor en tres niveles para microespuma',
      'Agua caliente: Función de agua caliente integrada (ducheta)',
      'Medidas (Al x An x L): 79.8 cm x 38.8 cm x 37 cm'
    ],
    features: [
      { label: 'Bomba ULKA 19 Bares', value: 'Bomba italiana con manómetro análogo integrado para extracción óptima' },
      { label: 'Molino 214° con Muelas Acero', value: 'Tolva de 210g y tiempo de molienda regulable de 5 a 20 segundos' },
      { label: 'Portafiltro 58 mm', value: 'Estándar profesional comercial con dos filtros incluidos' },
      { label: 'Gramera y Control Digital', value: 'Balanza digital integrada y control térmico PID de 90°C a 96°C' },
      { label: 'Termobloque 1600 W', value: 'Rápida respuesta térmica, vapor en 3 niveles y preinfusión de 90s' },
      { label: 'Tanque 2.8L + Ducheta', value: 'Gran autonomía de agua con salida dedicada para infusiones y té' }
    ],
    rating: 4.9
  },
  {
    id: 'bar-cafe-2g',
    brand: 'baristico',
    category: 'cafe',
    name: 'Bravetto Máquina Espresso Automática',
    description: 'Máquina espresso superautomática premium de alta precisión (Referencia: MAQ051322-001 - Color Negro) de la línea Bravetto Café & Bar. Equipada con pantalla HD táctil de 10.1 pulgadas para preparar automáticamente hasta 16 tipos de de bebidas, molino integrado de muelas cónicas de acero con 7 niveles de molienda y bomba Ulka Italiana de 19 bares.',
    price: 5999900,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/Caracteristica-empaque-1.webp',
    specs: [
      'Preparaciones: Hasta 16 tipos de bebidas de café y leche',
      'Pantalla: HD táctil de 10.1 pulgadas integrada',
      'Capacidad de insumos: 3.5 L de agua y 1000g de granos de café',
      'Presión y Bomba: Ulka Italiana de 19 bares',
      'Potencia y Conexión: 1300W | 110 - 120 V / 50 - 60 Hz',
      'Dimensiones (Al x An x L): 590 x 250 x 475 mm',
      'Peso Neto: 18.5 Kg',
      'Molienda: Molino integrado con 7 grados de ajuste'
    ],
    features: [
      { label: 'Cuerpo & Muelas', value: 'Cuerpo en ABS de alta resistencia y muelas de acero' },
      { label: 'Conexión de Agua Versátil', value: 'Depósito, Red directa o Botellón de agua' },
      { label: 'Flujo de Aire Regulable', value: 'Ajuste del nivel de flujo de aire en 8 grados' },
      { label: 'Personalización Completa', value: 'Ajuste de intensidad del café (3 niveles), leche, agua y vapor' },
      { label: 'Mantenimiento Automatizado', value: 'Función de autolimpieza y descalcificación automática' }
    ],
    rating: 4.9
  },
  {
    id: 'bar-cafe-3g',
    brand: 'carimali',
    category: 'cafe',
    name: 'Carimali Nimble 2 GR',
    description: 'Máquina espresso profesional tradicional de dos grupos (2 GR) en color negro, ideal para cafeterías con ritmo de servicio medio-alto. Combina un diseño exclusivo, elegante y compacto con una caldera de cobre de 11 litros con intercambiadores de calor para extracción continua de espresso. Hecha por Carimali, marca italiana premium con más de 100 años de trayectoria.',
    price: 13999999,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/CarimaliNegra-02.webp',
    specs: [
      'Grupos de erogación: 2 grupos de café',
      'Capacidad de caldera: 11 Litros',
      'Materiales: Caldera y tubería en cobre',
      'Precalentamiento: Rápido en 15 Minutos',
      'Potencia: 3000 W',
      'Conexión de agua: Red directa',
      'Dimensiones (An x Al x Pr): 610 x 475 x 500 mm',
      'Peso: Liviana (47 Kilos)',
      'Equipamiento: Dos lancetas de vapor y fuente de agua',
      'Iluminación: Luces LED integradas'
    ],
    features: [
      { label: 'Origen Italiano', value: 'Carimali es una marca de tradición italiana con más de 100 años en el mercado.' },
      { label: 'Tubería y Caldera en Cobre', value: 'Garantiza una durabilidad excepcional y excelente conductividad térmica.' },
      { label: 'Extracción Continua', value: 'Intercambiadores de calor que permiten servir espresso de forma constante y estable.' },
      { label: 'Fácil Programación', value: 'Panel intuitivo con 5 opciones de dosificación programables por grupo.' },
      { label: 'Diseño Exclusivo Negro', value: 'Acabado elegante en color negro que aporta un look sofisticado a cualquier barra.' },
      { label: 'Adaptabilidad de Altura', value: 'Incluye rejillas especiales para adaptar vasos y tazas de diferentes tamaños.' }
    ],
    rating: 4.9
  },
  {
    id: 'bar-cafe-compact',
    brand: 'bellezza',
    category: 'cafe',
    name: 'Bellezza Bellona Dual Boiler',
    description: 'Líneas rectas, moderno y potente: con Bellezza Bellona y su doble caldera nos acercamos a la perfección barista. Una máquina de espresso de gama alta que es una verdadera obra de arte, equipada con una gran palanca de vapor de madera, control PID y un diseño extraordinario disponible en negro, blanco y metal.',
    price: 7899899,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/Belleza-bellona-negro.webp',
    specs: [
      'Tipo de máquina: Doble caldera (Dual Boiler) aislada térmicamente',
      'Grupo de infusión: Grupo saturado de acero inoxidable Bellezza',
      'Capacidad de calderas: 500ml (café) + 1 Litro (vapor de acero inoxidable)',
      'Estabilidad térmica: Control PID Bellezza integrado',
      'Depósito de agua: Depósito exterior redondo de 1.8 Litros',
      'Conexión de agua: Permite conexión fija a red de agua directa',
      'Controles: Botones de control con cronómetro (Shot Timer) integrado',
      'Presión y Manómetro: Bomba de vibración con manómetro de presión de bomba',
      'Dimensiones (An x Al x Pr): 270 x 415 x 320 mm',
      'Peso y Potencia: 23 kg | Consumo energético de 2550 W',
      'Equipamiento premium: Tamper de acero inoxidable y 2 portafiltros'
    ],
    features: [
      { label: 'Doble Caldera Independiente', value: 'Permite extraer café a temperatura estable y texturizar leche con vapor infinito simultáneamente.' },
      { label: 'Palanca de Vapor con Mango de Madera', value: 'Gran palanca con mango de madera natural que proporciona un control instantáneo, ergonómico y elegante.' },
      { label: 'Depósito Redondo Externo', value: 'Diseño cilíndrico extravagante y moderno de 1.8L con sensor de nivel para evitar cortes en la erogación.' },
      { label: 'Control PID y Shot Timer', value: 'Regulación precisa de temperatura y visualización del tiempo de extracción para recetas perfectas.' },
      { label: 'Estética Minimalista y Vanguardista', value: 'Estructura compacta en acero inoxidable con acabados en negro, blanco o metal pulido.' },
      { label: 'Accesorios Profesionales Incluidos', value: 'Viene equipada con 2 portafiltros profesionales y tamper oficial Bellezza de acero inoxidable.' }
    ],
    rating: 4.8
  },
  {
    id: 'bar-grind-64',
    brand: 'eureka',
    category: 'molino',
    name: 'Eureka Helios 65',
    description: 'Molino de café profesional italiano de alta gama diseñado para un rendimiento excepcional en entornos de alta demanda. Equipado con muelas planas de 65 mm de acero inoxidable, panel táctil interactivo, dosificación programable electrónica y regulación micrométrica continua.',
    price: 4770144,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/molino-helios-65-1.webp',
    specs: [
      'Dimensiones (Al x An x Pr): 60 x 22 x 25 cm',
      'Peso y Potencia: 12 kg | 280 W',
      'Fuente de energía: 110 V / 60 Hz',
      'Muelas: Planas de 65 mm en acero inoxidable',
      'Capacidad de la tolva: 1.2 kg',
      'Productividad: 3.5 gr / 5 seg',
      'Pantalla: Control táctil interactivo',
      'Programable: Sí'
    ],
    features: [
      { label: 'Muelas de 65 mm', value: 'Muelas planas de acero inoxidable de gran precisión para un flujo constante.' },
      { label: 'Pantalla Táctil Digital', value: 'Panel táctil intuitivo con programación rápida para dosis simple, doble y continua.' },
      { label: 'Gran Capacidad de Tolva', value: 'Tolva de 1.2 kg que asegura continuidad en barras de café de alto tráfico.' },
      { label: 'Regulación Micrométrica', value: 'Control fino continuo patentado para ajuste exacto del punto de molienda.' }
    ],
    rating: 4.9
  },
  {
    id: 'bar-grind-silent',
    brand: 'baristico',
    category: 'molino',
    name: 'Eureka Mignon Specialità',
    description: 'Molino de café italiano de alta precisión con tecnología silenciosa y panel táctil. Equipado con muelas planas de 55 mm de acero inoxidable, baja retención de café, regulación micrométrica continua y dosis programables.',
    price: 3800000,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/molino-mignon-specialita.webp',
    specs: [
      'Dimensiones (Al x An x Pr): 350 x 120 x 180 mm',
      'Peso y Potencia: 5.6 kg | 310 W',
      'Fuente de energía: 110 V / 60 Hz',
      'Muelas: Planas de 55 mm en acero inoxidable',
      'Molienda: Especial para espresso, filtrado y métodos',
      'Productividad: 1.2 - 1.8 g/seg',
      'Capacidad de tolva: 300 g',
      'Pantalla: Control táctil integrado',
      'Programable: Dosificación electrónica de dosis simple y doble',
      'Retención: Sistema de baja retención'
    ],
    features: [
      { label: 'Tecnología Silenciosa', value: 'Molienda de alta precisión optimizada acústicamente.' },
      { label: 'Regulación Micrométrica', value: 'Ajuste continuo micrométrico patentado por Eureka.' },
      { label: 'Pantalla Táctil Digital', value: 'Programación intuitiva para dosis simples y dobles.' }
    ],
    rating: 4.9
  },
  {
    id: 'bar-grind-onix',
    brand: 'baristico',
    category: 'molino',
    name: 'Barístico Molino Onix Pro',
    description: 'Molino de café profesional Onix Pro de diseño compacto y alta precisión. Equipado con muelas cónicas de 58 mm de acero inoxidable, ajuste de molienda de 30 a 60 niveles y control de tiempo personalizable de 0 a 50 segundos. Diseñado con doble protección contra sobrecargas y sistema antiestático que evita la dispersión del café molido.',
    price: 549900,
    image: 'https://distritocafetero.com/wp-content/uploads/2026/07/3_MOLINO_ONYXPRO_MAQ090805-001.webp',
    specs: [
      'Dimensiones (An x Al x Pr): 149 x 341.5 x 212 mm',
      'Peso y Potencia: 2.6 kg | 150 W',
      'Voltaje y Frecuencia: 110 V | 60Hz',
      'Velocidad de giro: 9000 rpm',
      'Ajuste de molienda: De 30 a 60 ajustes',
      'Muelas: Cónicas de 58 mm en acero inoxidable',
      'Control de tiempo: Personalizable de 0 a 50 segundos',
      'Soporte de portafiltros: Compatible con portafiltros de 51 a 58 mm',
      'Capacidad de tolva: 250 gramos'
    ],
    features: [
      { label: 'Doble Protección', value: 'Protección de seguridad activa contra sobrecarga y sobrecalentamiento.' },
      { label: 'Operación Silenciosa', value: 'Molienda optimizada acústicamente con menos de 83 DBA.' },
      { label: 'Tecnología Anti-estática', value: 'Sistema de reducción estática que evita que el café molido se disperse.' }
    ],
    rating: 4.8
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'sol-001',
    venueName: 'Café del Arte',
    venueType: 'cafeteria',
    city: 'Cali',
    contactName: 'Sofía Martínez',
    contactEmail: 'gerencia@cafedelartesevilla.com',
    contactPhone: '3151234567',
    description: 'Estamos reformando una cafetería clásica para convertirla en bar de especialidad. Buscamos un pack completo de compra de cafetera de 3 grupos y un molino on-demand silencioso con financiación directa.',
    items: [
      { productId: 'bar-cafe-3g', quantity: 1, mode: 'purchase' },
      { productId: 'bar-grind-silent', quantity: 1, mode: 'purchase' }
    ],
    status: 'oferta_enviada',
    createdAt: '2026-06-28T10:30:00Z',
    offers: [
      {
        id: 'off-101',
        supplierName: 'Distribuciones Horeca de Colombia',
        priceProposed: 22500000,
        modeProposed: 'purchase',
        comments: 'Les ofrecemos la Barístico Espresso Elite 3G + Molino Silent con instalación y calibración de baristas de regalo. Ofrecemos garantía de 3 años y opción de pago a 12 cuotas.',
        createdAt: '2026-06-28T16:00:00Z',
        approved: false
      }
    ]
  },
  {
    id: 'sol-002',
    venueName: 'Club Tropicana',
    venueType: 'discoteca',
    city: 'Medellín',
    contactName: 'Carlos Gómez',
    contactEmail: 'compras@clubtropicanamalaga.es',
    contactPhone: '3128877661',
    description: 'Necesitamos renovar las granizadoras y la máquina de hielo de cara a la temporada de fin de año. La máquina de hielo tiene que ser de gran capacidad ya que gastamos mucho en cubos para combinados.',
    items: [
      { productId: 'artiq-gran-3', quantity: 2, mode: 'purchase' },
      { productId: 'artiq-ice-110', quantity: 1, mode: 'purchase' }
    ],
    status: 'pendiente',
    createdAt: '2026-06-29T14:15:00Z',
    offers: []
  },
  {
    id: 'sol-003',
    venueName: 'Hotel Mirador',
    venueType: 'hotel',
    city: 'Bogotá',
    contactName: 'Elena Ruiz',
    contactEmail: 'direccion@miradorcantabricohotel.com',
    contactPhone: '3203127894',
    description: 'Para el salón de desayunos buffet necesitamos dispensación de zumos moderna y una cafetera compacta para los clientes que prefieren espresso preparado al momento.',
    items: [
      { productId: 'artiq-disp-juice', quantity: 2, mode: 'purchase' },
      { productId: 'bar-cafe-compact', quantity: 1, mode: 'purchase' }
    ],
    status: 'pendiente',
    createdAt: '2026-06-30T07:22:00Z',
    offers: []
  }
];

export const INITIAL_PUBLIC_NEEDS: PublicNeed[] = [
  {
    id: 'need-201',
    venueName: 'Pizzería Bella Napoli',
    venueType: 'Restaurante',
    city: 'Barranquilla',
    contactName: 'Matteo Rossi',
    contactEmail: 'matteo@bellanapolivalencia.com',
    description: 'Queremos añadir un rincón de cafés especiales en la pizzería. Buscamos proveedor que nos venda una máquina de 2 grupos y nos dé formación para los camareros. Nos interesa opción de compra con facilidades de pago.',
    brandInterest: 'baristico',
    createdAt: '2026-06-25T11:00:00Z',
    replies: [
      {
        id: 'rep-301',
        supplierName: 'Equipamiento Hostelería del Caribe',
        message: 'Hola Matteo, podemos ofrecerte la Bravetto Máquina Espresso Automática con financiación en 12 meses sin intereses. Incluimos curso de barista de 4 horas gratis para tu plantilla. ¿Cuándo podemos llamarte?',
        costEstimate: '$5.999.900 COP (Financiación disponible)',
        createdAt: '2026-06-25T15:20:00Z'
      }
    ]
  },
  {
    id: 'need-202',
    venueName: 'Chiringuito Blue Wave',
    venueType: 'Bar',
    city: 'Cartagena (Bocagrande)',
    contactName: 'Andrés Soler',
    contactEmail: 'andres@bluewavebcn.com',
    description: 'Buscamos pack completo para terraza de playa: 2 granizadoras triples y un productor de hielo de mínimo 100kg diarios. Imprescindible soporte técnico rápido de mantenimiento en Cartagena.',
    brandInterest: 'artiq',
    createdAt: '2026-06-27T09:12:00Z',
    replies: [
      {
        id: 'rep-302',
        supplierName: 'Frío Industrial del Norte S.A.S.',
        message: 'Tenemos stock inmediato de Artiq en la Costa Caribe. Te ofrecemos un precio de paquete especial por la compra directa de los tres equipos con garantía ampliada de 3 años y mantenimiento preventivo gratuito por el primer año.',
        costEstimate: '$25.000.000 COP (Descuento por combo)',
        createdAt: '2026-06-27T13:45:00Z'
      }
    ]
  },
  {
    id: 'need-203',
    venueName: 'Gourmet Club Chicó',
    venueType: 'Otros',
    city: 'Bogotá (Chicó)',
    contactName: 'Inés Castro',
    contactEmail: 'ines@gourmetclubmadrid.es',
    description: 'Buscamos equipación de la más alta calidad para club gastronómico privado. Nos interesa comprar la cafetera Barístico 3G con molino cónico silencioso, además de un dispensador para degustaciones frías. Priorizamos el acabado estético.',
    brandInterest: 'ambos',
    createdAt: '2026-06-29T18:05:00Z',
    replies: []
  }
];
