export interface Product {
  id: string;
  brand: 'artiq' | 'baristico' | 'carimali' | 'bellezza' | 'eureka';
  category: 'granizadora' | 'hielo' | 'dispensador' | 'cafe' | 'molino';
  name: string;
  description: string;
  price: number; // Compra sugerida en COP
  rentalPrice?: number; // Renting opcional desactivado
  specs: string[];
  features: { label: string; value: string }[];
  rating: number;
  image?: string;
}

export interface RequestedProductItem {
  productId: string;
  quantity: number;
  mode: 'purchase' | 'rent';
}

export interface Inquiry {
  id: string;
  venueName: string;
  venueType: 'bar' | 'restaurante' | 'cafeteria' | 'discoteca' | 'hotel' | 'otro';
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  items: RequestedProductItem[];
  status: 'pendiente' | 'contactado' | 'oferta_enviada' | 'aceptado';
  createdAt: string;
  offers: SupplierOffer[];
}

export interface SupplierOffer {
  id: string;
  supplierName: string;
  priceProposed: number;
  modeProposed: 'purchase' | 'rent';
  comments: string;
  createdAt: string;
  approved: boolean;
}

export interface PublicNeed {
  id: string;
  venueName: string;
  venueType: string;
  city: string;
  contactName: string;
  contactEmail: string;
  description: string;
  brandInterest: 'artiq' | 'baristico' | 'ambos';
  createdAt: string;
  replies: {
    id: string;
    supplierName: string;
    message: string;
    costEstimate: string;
    createdAt: string;
  }[];
}
