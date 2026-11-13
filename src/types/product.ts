export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  active?: boolean;
  description?: string;
  originalPrice?: number;
  externalUrl?: string;
  order?: number;
  instructions?: string;
  ratingAverage?: number;
  ratingCount?: number;
  likesCount?: number;
  savesCount?: number;
}
