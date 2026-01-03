
import { GoogleGenAI } from "@google/genai";

export const isApiKeyConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key not found. Using local fallback enhancement.");
    return `${originalPrompt}, masterpiece, highly detailed, 8k, cinematic lighting, ultra-realistic textures`;
  }

  try {
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey });
    
    // Fix: Use 'gemini-3-flash-preview' as recommended for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional prompt engineer for Bamania AI. 
      Your task is to take a simple prompt and transform it into a high-detail, artistic masterpiece description optimized for a Flux-based image generator.
      
      Original: ${originalPrompt}
      
      Follow these rules:
      1. Add atmospheric lighting (e.g., volumetric, cinematic, neon).
      2. Specify artistic medium (e.g., hyper-realistic digital art, oil painting, unreal engine 5 render).
      3. Use sensory adjectives and high-resolution keywords (8k, masterpiece, intricate textures).
      4. Keep the core subject of the original prompt but elevate its grandeur.
      5. Return ONLY the final enhanced string. No explanations.`,
    });
    
    // Access the text property directly from GenerateContentResponse
    const enhancedText = response.text?.trim();
    if (!enhancedText) throw new Error("Empty response from Gemini");
    
    console.log("Prompt enhanced successfully via Gemini 3 Flash.");
    return enhancedText;
  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return `${originalPrompt}, highly detailed masterpiece, cinematic lighting, 8k resolution`;
  }
};
