import { BibleVerse } from "../types";

export interface CounselResponse {
  comfort: string;
  verses: BibleVerse[];
  prayer: string;
}

export async function getPastoralCounsel(situation: string, customApiKey?: string): Promise<CounselResponse> {
  const apiKey = customApiKey || import.meta.env.VITE_HF_API_KEY || localStorage.getItem("HF_API_KEY") || "";

  if (!apiKey) {
    throw new Error("Hugging Face API key is not configured. Please add your key in the settings (top-right icon).");
  }

  // Using a more capable model for varied, context-aware responses
  const model = "mistralai/Mistral-7B-Instruct-v0.3";
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  // Create a unique prompt with context to ensure varied responses
  const prompt = `[INST] You are ChristCounsel, a compassionate and wise pastoral guide speaking in a soft, smooth, comforting Christian tone.
A person comes to you with this specific concern: "${situation}"

Provide a PERSONALIZED response tailored specifically to their situation. Do not give generic advice.
Your response MUST be split into exactly three parts in valid JSON:
1. "comfort": Personalized pastoral words that directly address their specific concern, quoting appropriate Holy Scripture, explaining it with grace, and concluding with: "Don't fear, I am with you."
2. "verses": An array of 2-3 relevant Bible scripture verses SPECIFIC TO THEIR SITUATION, each with reference (e.g. "Psalm 23:1") and full text.
3. "prayer": A short, personal, beautiful prayer written SPECIFICALLY for their concern.

Respond ONLY with valid JSON, no extra text:
{
  "comfort": "personalized pastoral words addressing their specific concern... Don't fear, I am with you.",
  "verses": [
    {"reference": "Specific verse reference", "text": "Full verse text"},
    {"reference": "Another relevant verse", "text": "Full verse text"}
  ],
  "prayer": "personalized prayer for their specific situation..."
} [/INST]`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.85,
          top_p: 0.95,
          repetition_penalty: 1.1,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `HTTP ${response.status} Error`;
      throw new Error(`Failed to call Hugging Face API: ${message}`);
    }

    const result = await response.json();
    // The Hugging Face API returns an array of objects with generated_text
    const textContent = Array.isArray(result) && result[0]?.generated_text
      ? result[0].generated_text.trim()
      : typeof result === 'string'
        ? result.trim()
        : '';

    if (!textContent) {
      throw new Error("No response received from Hugging Face API.");
    }

    // Try to parse the JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(textContent);
    } catch (parseError) {
      console.error("Failed to parse HF response as JSON:", textContent);
      // Fallback: try to extract JSON from text if it's wrapped in markdown or extra text
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error("Invalid response format received from Hugging Face API.");
        }
      } else {
        throw new Error("Invalid response format received from Hugging Face API.");
      }
    }

    // Validate the structure
    if (!parsed.comfort || !Array.isArray(parsed.verses) || !parsed.prayer) {
      throw new Error("Invalid response structure from Hugging Face API.");
    }

    // Validate verses array elements
    const validatedVerses = parsed.verses.map((v: any) => {
      if (v.reference && v.text) {
        return { reference: v.reference, text: v.text };
      }
      return { reference: "Unknown", text: "Verse not available" };
    }).filter(v => v.reference && v.text);

    return {
      comfort: parsed.comfort,
      verses: validatedVerses.length > 0 ? validatedVerses : [{ reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." }],
      prayer: parsed.prayer
    };
  } catch (err: any) {
    console.error("Error in getPastoralCounsel:", err);
    // Fallback response
    return {
      comfort: "I feel your heavy heart. Even in silence, My presence sustains you. Put your doubts aside for just this moment. Don't fear, I am with you.",
      verses: [{ reference: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." }],
      prayer: "Lord, hear my prayer and grant me peace in Your presence."
    };
  }
}