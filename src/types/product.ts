export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  description?: string;
  originalPrice?: number;
  externalUrl?: string;
  order?: number;
}
