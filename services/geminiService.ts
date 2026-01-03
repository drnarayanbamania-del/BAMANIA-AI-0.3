
import { GoogleGenAI } from "@google/genai";

export const isApiKeyConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

// Fix: Use direct process.env.API_KEY for GoogleGenAI initialization
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key not found. Using local fallback enhancement.");
    return `${originalPrompt}, masterpiece, highly detailed, 8k, cinematic lighting, ultra-realistic textures`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for high-quality text-to-prompt expansion
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional prompt engineer for Bamania AI. 
      Transform this simple prompt into a hyper-detailed, artistic visual protocol for an image generator.
      
      Original: ${originalPrompt}
      
      Requirements:
      1. Atmospheric lighting (volumetric, cinematic, neon, or golden hour).
      2. Specific artistic medium (hyper-realistic, octane render, oil painting, etc.).
      3. Sensory details and texture keywords (intricate, 8k, masterwork).
      4. Elevate the concept while keeping the core subject.
      5. Return ONLY the final enhanced string. No meta-talk.`,
    });
    
    const enhancedText = response.text;
    if (!enhancedText) throw new Error("Empty response from Gemini");
    
    return enhancedText.trim();
  } catch (error) {
    console.error("Gemini 3 enhancement failure:", error);
    return `${originalPrompt}, highly detailed masterpiece, cinematic lighting, 8k resolution`;
  }
};
