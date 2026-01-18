
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestDeliveryFee(productPrice: number, distance: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a fair delivery fee for a product costing $${productPrice} being delivered to ${distance}. Return only a number.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return parseFloat(response.text || "10");
  } catch (error) {
    console.error("Gemini Error:", error);
    return 10;
  }
}

export async function enhanceProductDescription(productName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a 1-sentence catchy description for a delivery listing of: ${productName}.`,
    });
    return response.text || "Standard delivery package.";
  } catch (error) {
    return "Handled with care.";
  }
}
