import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { Product, InsertProduct } from "@shared/schema";

export class ProductService {
  async getProduct(id: string): Promise<Product | undefined> {
    return storage.getProduct(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return storage.getAllProducts();
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const product = await storage.createProduct(data);
    
    await eventBus.publish({
      type: "com.photonictag.product.created",
      source: "product-service",
      data: product,
      subject: product.id,
    });

    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct> & { qrCodeData?: string | null }): Promise<Product | undefined> {
    const product = await storage.updateProduct(id, data);
    
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

  async deleteProduct(id: string): Promise<boolean> {
    const product = await storage.getProduct(id);
    const deleted = await storage.deleteProduct(id);
    
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
