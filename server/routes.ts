import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import QRCode from "qrcode";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function generateQRCode(productId: string): Promise<string> {
  const url = `/product/${productId}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  return qrDataUrl;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product
  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await storage.createProduct(parsed.data);
      
      // Generate QR code for the product
      const qrCodeData = await generateQRCode(product.id);
      const updatedProduct = await storage.updateProduct(product.id, { qrCodeData });
      
      res.status(201).json(updatedProduct || product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update product
  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const existingProduct = await storage.getProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await storage.updateProduct(req.params.id, parsed.data);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // AI Summarize endpoint
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const prompt = `You are an expert product analyst. Analyze the following product information and provide a concise summary with key features.

Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint}kg CO2e
Repairability Score: ${product.repairabilityScore}/10
Warranty: ${product.warrantyInfo}

Respond in JSON format with exactly these fields:
{
  "summary": "A 2-3 sentence professional summary of the product",
  "keyFeatures": ["feature1", "feature2", "feature3"] // 3-5 key features as strings
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // AI Sustainability endpoint
  app.post("/api/ai/sustainability", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const prompt = `You are an expert sustainability analyst. Analyze the following product's environmental impact and provide insights.

Product: ${product.productName}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint}kg CO2e
Repairability Score: ${product.repairabilityScore}/10
Recycling Instructions: ${product.recyclingInstructions}

Respond in JSON format with exactly these fields:
{
  "overallScore": <number 0-100 representing sustainability score>,
  "carbonAnalysis": "Analysis of the carbon footprint and comparison to industry averages",
  "circularityRecommendations": ["recommendation1", "recommendation2"], // 2-3 circularity recommendations
  "improvements": ["improvement1", "improvement2", "improvement3"] // 3-4 specific improvement suggestions
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 600,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating sustainability insights:", error);
      res.status(500).json({ error: "Failed to generate sustainability insights" });
    }
  });

  // AI Repair Summary endpoint
  app.post("/api/ai/repair-summary", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const prompt = `You are an expert repair technician. Analyze the following product and provide repair guidance.

Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Materials: ${product.materials}
Repairability Score: ${product.repairabilityScore}/10
Warranty: ${product.warrantyInfo}

Respond in JSON format with exactly these fields:
{
  "repairabilityRating": "Easy/Moderate/Difficult based on the score",
  "repairInstructions": ["step1", "step2", "step3"], // 3-5 general repair guidelines
  "commonIssues": ["issue1", "issue2"], // 2-3 common issues for this type of product
  "partsAvailability": "Assessment of spare parts availability and sourcing"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating repair summary:", error);
      res.status(500).json({ error: "Failed to generate repair summary" });
    }
  });

  return httpServer;
}
