const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function generateGeminiResponse(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("Gemini API key missing");
  }

  if (!prompt || prompt.trim().length < 3) {
    throw new Error("Please enter a valid prompt");
  }

  try {
    const response = await fetch(${API_URL}?key=${API_KEY}, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Gemini API failed");
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from AI");
    }

    return text;
  } catch (err) {
    console.error(err);
    throw new Error("AI generation failed. Try again.");
  }
}