
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => process.env.API_KEY || '';

export const isApiKeyConfigured = (): boolean => {
  const key = getApiKey();
  return key !== '' && !key.startsWith('YOUR_API_KEY');
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  if (!isApiKeyConfigured()) {
    console.warn("Gemini API Key not found. Using local fallback enhancement.");
    return `${originalPrompt}, masterpiece, highly detailed, 8k, cinematic lighting, ultra-realistic textures`;
  }

  try {
    const ai = getAI();
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
    
    const enhancedText = response.text?.trim();
    if (!enhancedText) throw new Error("Empty response from Gemini");
    
    console.log("Prompt enhanced successfully via Gemini.");
    return enhancedText;
  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return `${originalPrompt}, masterpiece, highly detailed, 8k, cinematic lighting, 4k resolution`;
  }
};
