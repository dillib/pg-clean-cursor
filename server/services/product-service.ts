import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { Product, InsertProduct } from "@shared/schema";

export interface ProductStore {
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export class ProductService {
  async getProduct(id: string, store: ProductStore = storage): Promise<Product | undefined> {
    return store.getProduct(id);
  }

  async getAllProducts(store: ProductStore = storage): Promise<Product[]> {
    return store.getAllProducts();
  }

  async createProduct(data: InsertProduct, store: ProductStore = storage): Promise<Product> {
    const product = await store.createProduct(data);

    await eventBus.publish({
      type: "com.photonictag.product.created",
      source: "product-service",
      data: product,
      subject: product.id,
    });

    return product;
  }

  async updateProduct(
    id: string,
    data: Partial<InsertProduct> & { qrCodeData?: string | null },
    store: ProductStore = storage,
  ): Promise<Product | undefined> {
    const product = await store.updateProduct(id, data);

    if (product) {
      await eventBus.publish({
        type: "com.photonictag.product.updated",
        source: "product-service",
        data: product,
        subject: product.id,
      });
    }

    return product;
  }

  async deleteProduct(id: string, store: ProductStore = storage): Promise<boolean> {
    const product = await store.getProduct(id);
    const deleted = await store.deleteProduct(id);

    if (deleted && product) {
      await eventBus.publish({
        type: "com.photonictag.product.deleted",
        source: "product-service",
        data: { id, productName: product.productName },
        subject: id,
      });
    }

    return deleted;
  }
}

export const productService = new ProductService();
