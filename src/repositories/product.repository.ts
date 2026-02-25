import { promises as fs } from "fs";
import path from "path";
import { ProductType } from "../types/product.type";

const storagePath = path.resolve(process.cwd(), "src/data/products.local.json");

class ProductRepository {
  private async ensureStorageFile() {
    const dir = path.dirname(storagePath);
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(storagePath);
    } catch {
      await fs.writeFile(storagePath, JSON.stringify([], null, 2), "utf-8");
    }
  }

  private async readAll(): Promise<ProductType[]> {
    await this.ensureStorageFile();
    const raw = await fs.readFile(storagePath, "utf-8");

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ProductType[]) : [];
    } catch {
      return [];
    }
  }

  private async writeAll(products: ProductType[]) {
    await this.ensureStorageFile();
    await fs.writeFile(storagePath, JSON.stringify(products, null, 2), "utf-8");
  }

  async create(product: ProductType): Promise<ProductType> {
    const products = await this.readAll();
    products.unshift(product);
    await this.writeAll(products);
    return product;
  }

  async getInventory(filters?: {
    sellerId?: string;
    search?: string;
  }): Promise<ProductType[]> {
    const products = await this.readAll();
    const sellerId = filters?.sellerId;
    const search = filters?.search?.toLowerCase();

    return products.filter((product) => {
      if (sellerId && product.sellerId !== sellerId) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchable = `${product.name} ${product.category ?? ""} ${product.description ?? ""}`.toLowerCase();
      return searchable.includes(search);
    });
  }

  async deleteById(productId: string): Promise<boolean> {
    const products = await this.readAll();
    const next = products.filter(
      (p) => String((p as any).id ?? (p as any)._id) !== String(productId)
    );
    const deleted = next.length !== products.length;
    if (deleted) {
      await this.writeAll(next);
    }
    return deleted;
  }
}

export const productRepository = new ProductRepository();
