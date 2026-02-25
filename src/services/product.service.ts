import { v4 as uuidv4 } from "uuid";
import { CreateProductDto, InventoryQueryDto } from "../dtos/product.dto";
import { productRepository } from "../repositories/product.repository";
import { ProductType } from "../types/product.type";

export class ProductService {
  async addProduct(payload: CreateProductDto): Promise<ProductType> {
    const now = new Date().toISOString();
    const product: ProductType = {
      id: uuidv4(),
      sellerId: payload.sellerId,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      unit: payload.unit,
      price: payload.price,
      stock: payload.stock,
      imageUrl: payload.imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    return productRepository.create(product);
  }

  async getInventory(query: InventoryQueryDto): Promise<ProductType[]> {
    return productRepository.getInventory({
      sellerId: query.sellerId,
      search: query.search,
    });
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return productRepository.deleteById(productId);
  }
}
