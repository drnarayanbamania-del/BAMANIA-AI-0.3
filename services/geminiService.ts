
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
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-2.5-flash-native-audio-preview-09-2025 as the 2.5 series text handler
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: `You are a professional prompt engineer for Bamania AI. 
      Your task is to take a simple prompt and transform it into a high-detail, artistic masterpiece description optimized for an image generator.
      
      Original: ${originalPrompt}
      
      Follow these rules:
      1. Add atmospheric lighting (e.g., volumetric, cinematic, neon).
      2. Specify artistic medium (e.g., hyper-realistic digital art, unreal engine 5 render).
      3. Use sensory adjectives and high-resolution keywords (8k, masterpiece, intricate textures).
      4. Keep the core subject but elevate its grandeur.
      5. Return ONLY the final enhanced string. No explanations.`,
    });
    
    const enhancedText = response.text?.trim();
    if (!enhancedText) throw new Error("Empty response from Gemini");
    
    return enhancedText;
  } catch (error) {
    console.error("Gemini 2.5 enhancement failed:", error);
    return `${originalPrompt}, highly detailed masterpiece, cinematic lighting, 8k resolution`;
  }
};
