import { useState } from "react";
import { generateImage } from "./services/geminiService";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return alert("Prompt likho bhai 😅");
    setLoading(true);
    const img = await generateImage(prompt);
    setImage(img);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>🚀 Bamania AI</h1>

      <input
        style={styles.input}
        placeholder="Describe your image..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button style={styles.button} onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {image && <img src={image} style={styles.image} />}
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  input: {
    padding: "10px",
    width: "300px",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
  image: {
    marginTop: "20px",
    maxWidth: "300px",
    borderRadius: "10px",
  },
};
