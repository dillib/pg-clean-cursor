import OpenAI from "openai";
import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { 
  AIInsight, 
  InsertAIInsight, 
  AIInsightType,
  Product,
  AISummary,
  SustainabilityInsight,
  RepairSummary,
  CircularityScore,
  RiskAssessment
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function getChatCompletion(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
  });
  
  return response.choices[0]?.message?.content || "{}";
}

export class AIService {
  async getInsight(id: string): Promise<AIInsight | undefined> {
    return storage.getAIInsight(id);
  }

  async getInsightsByProductId(productId: string): Promise<AIInsight[]> {
    return storage.getAIInsightsByProductId(productId);
  }

  async generateSummary(product: Product): Promise<AISummary> {
    const prompt = `Summarize this product for a Digital Product Passport:
Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint} kg CO2e
Repairability Score: ${product.repairabilityScore}/10

Provide a concise summary (2-3 sentences) and list 3-5 key features.
Respond in JSON format: { "summary": "...", "keyFeatures": ["...", "..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as AISummary;

    await this.storeInsight(product.id, "summary", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateSustainabilityInsight(product: Product): Promise<SustainabilityInsight> {
    const prompt = `Analyze sustainability for this product:
Product: ${product.productName}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint} kg CO2e
Recycling Instructions: ${product.recyclingInstructions}

Provide:
1. Overall sustainability score (1-100)
2. Carbon footprint analysis
3. Circularity recommendations
4. Improvement suggestions

Respond in JSON format: { "overallScore": 75, "carbonAnalysis": "...", "circularityRecommendations": ["..."], "improvements": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as SustainabilityInsight;

    await this.storeInsight(product.id, "sustainability", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateRepairSummary(product: Product): Promise<RepairSummary> {
    const prompt = `Generate repair guidance for:
Product: ${product.productName}
Materials: ${product.materials}
Repairability Score: ${product.repairabilityScore}/10
Warranty: ${product.warrantyInfo}

Provide:
1. Repairability rating (Excellent/Good/Fair/Poor)
2. Common repair instructions
3. Common issues
4. Parts availability assessment

Respond in JSON format: { "repairabilityRating": "...", "repairInstructions": ["..."], "commonIssues": ["..."], "partsAvailability": "..." }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as RepairSummary;

    await this.storeInsight(product.id, "repair", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateCircularityScore(product: Product): Promise<CircularityScore> {
    const recycledContent = product.recycledContentPercent ?? 0;
    const recyclability = product.recyclabilityPercent ?? 0;
    
    const prompt = `Analyze circularity and material efficiency for this product:
Product: ${product.productName}
Materials: ${product.materials}
Recycled Content: ${recycledContent}%
Recyclability: ${recyclability}%
Recycling Instructions: ${product.recyclingInstructions}
Disassembly Instructions: ${product.disassemblyInstructions || "Not provided"}
Take-Back Programs: ${JSON.stringify(product.takeBackPrograms || [])}

Provide a circularity assessment:
1. Overall circularity score (0-100)
2. Grade (A+, A, B, C, D, F)
3. Recyclability analysis
4. Material efficiency assessment
5. End-of-life options
6. Improvement recommendations

Respond in JSON format: { "score": 75, "grade": "B", "recyclabilityAnalysis": "...", "materialEfficiency": "...", "endOfLifeOptions": ["..."], "recommendations": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as CircularityScore;

    await this.storeInsight(product.id, "circularity", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateRiskAssessment(product: Product): Promise<RiskAssessment> {
    const hasAllFields = !!(product.manufacturer && product.batchNumber && product.materials && 
      product.carbonFootprint && product.recyclingInstructions);
    const hasCertifications = (product.safetyCertifications?.length ?? 0) > 0;
    const hasCeMarking = product.ceMarking === true;
    
    const prompt = `Analyze risk factors for this Digital Product Passport:
Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Country of Origin: ${product.countryOfOrigin || "Not specified"}
Batch Number: ${product.batchNumber}
CE Marking: ${hasCeMarking ? "Yes" : "No"}
Safety Certifications: ${JSON.stringify(product.safetyCertifications || [])}
Environmental Certifications: ${JSON.stringify(product.environmentalCertifications || [])}
Has Complete Core Data: ${hasAllFields ? "Yes" : "No"}

Analyze and identify:
1. Overall risk level (Low/Medium/High)
2. Specific risk flags with severity and descriptions
3. Data completeness percentage (0-100)
4. Counterfeit risk assessment
5. Any compliance issues
6. Recommendations for risk mitigation

Consider: missing mandatory fields, certification gaps, traceability issues, potential counterfeit indicators.

Respond in JSON format: { "overallRisk": "Low", "riskFlags": [{"type": "...", "severity": "Low", "description": "..."}], "dataCompleteness": 85, "counterfeitRisk": "...", "complianceIssues": ["..."], "recommendations": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as RiskAssessment;

    await this.storeInsight(product.id, "risk_assessment", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  private async storeInsight(productId: string, insightType: AIInsightType, content: Record<string, unknown>): Promise<AIInsight> {
    const insightData: InsertAIInsight = {
      productId,
      insightType,
      content,
      model: "gpt-4o",
      isStale: false,
    };

    const insight = await storage.createAIInsight(insightData);

    await eventBus.publish({
      type: "com.photonictag.ai.insights_generated",
      source: "ai-service",
      data: { insightId: insight.id, productId, insightType },
      subject: productId,
    });

    return insight;
  }

  async markInsightsStale(productId: string): Promise<void> {
    await storage.markInsightStale(productId);
  }
}

export const aiService = new AIService();
