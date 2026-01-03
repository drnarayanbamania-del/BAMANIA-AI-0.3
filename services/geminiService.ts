
import { GoogleGenAI } from "@google/genai";

export const isApiKeyConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return `${originalPrompt}, masterpiece, high detail, 8k, cinematic`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-flash-preview for the highest quality prompt expansion
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform the following short concept into a vivid, hyper-detailed artistic prompt for an image generator. 
      Focus on lighting, texture, and artistic medium. 
      Subject: ${originalPrompt}. 
      Return ONLY the expanded prompt text.`,
    });
    
    // Strictly use .text property as per guidelines
    const enhancedText = response.text;
    if (!enhancedText) throw new Error("Empty neural response");
    
    return enhancedText.trim();
  } catch (error) {
    console.error("Prompt expansion failure:", error);
    return `${originalPrompt}, ultra detailed, cinematic masterpiece, 8k`;
  }
};
