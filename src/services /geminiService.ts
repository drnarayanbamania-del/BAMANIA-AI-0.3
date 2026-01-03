// src/services/geminiService.ts

export async function generateImage(prompt: string): Promise<string> {
  // अभी DEMO image use कर रहे हैं
  // ताकि site 100% working हो जाए

  console.log("Prompt received:", prompt);

  // random demo image
  return "https://picsum.photos/512?random=" + Math.floor(Math.random() * 1000);
}
