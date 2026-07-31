export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  vatRate: number;
  stockQuantity: number;
  categoryId: string;
  categoryName: string;
  attributes: Record<string, string>;
  imageIds: string[];
  available: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  vatRate: number;
  stockQuantity: number;
  categoryId: string;
  attributes: Record<string, string>;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}
