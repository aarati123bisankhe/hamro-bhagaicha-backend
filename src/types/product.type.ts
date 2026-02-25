export interface ProductType {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

