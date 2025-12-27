import { GoogleGenAI, Type } from "@google/genai";
import { ScreenData, UIComponent } from "../types";

const apiKey = process.env.API_KEY || ''; 
// In a real app, we might handle missing keys gracefully, but here we assume it's present as per instructions.

const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON string if it comes with markdown code blocks
function cleanJson(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean;
}

export const GeminiService = {
  /**
   * Generates a Mobile UI Layout using Gemini 3 Pro with Thinking.
   */
  generateMobileUI: async (prompt: string, brandName: string, mood: string): Promise<ScreenData> => {
    try {
      const systemPrompt = `
        You are a world-class Mobile UI/UX Designer.
        Generate a JSON structure for a mobile app screen based on the user's request.
        
        Brand Name: ${brandName}
        Mood: ${mood}
        
        Rules:
        1. Use "type" one of: 'Button', 'Card', 'Input', 'Header', 'Text', 'Image', 'Navbar', 'List'.
        2. "style" must be an object with React-compatible CSS properties (camelCase), but values should be Tailwind-like conceptual values if possible, or standard CSS.
        3. Ensure high contrast and mobile accessibility.
        4. Create a complete, realistic layout with at least 5-8 components.
        5. Return ONLY valid JSON.
        
        Structure:
        {
          "id": "screen_1",
          "name": "Home",
          "backgroundColor": "#1e293b",
          "components": [ ... ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `${systemPrompt}\n\nUser Prompt: ${prompt}`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(cleanJson(text));
      return data as ScreenData;

    } catch (error) {
      console.error("Gemini UI Generation Error:", error);
      throw error;
    }
  },

  /**
   * Analyzes a screenshot to generate UI (simulated flow for this app structure).
   * We use Gemini 3 Pro multimodal capabilities.
   */
  analyzeScreenshot: async (base64Image: string): Promise<ScreenData> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: "Analyze this mobile UI screenshot. Reconstruct it as a JSON UI definition following the schema: { id, name, backgroundColor, components: [{id, type, style, content, src}] }. Be precise with colors and layout."
            }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      return JSON.parse(cleanJson(text)) as ScreenData;
    } catch (error) {
      console.error("Gemini Screenshot Analysis Error:", error);
      throw error;
    }
  },

  /**
   * Edits an image asset using Gemini 2.5 Flash Image ("Nano banana").
   */
  editImage: async (base64Image: string, prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image
              }
            },
            {
              text: prompt
            }
          ]
        },
        // Note: gemini-2.5-flash-image typically returns a generated image in the response parts
      });

      // Extract the image from the response
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
          }
        }
      }
      throw new Error("No image generated");
    } catch (error) {
      console.error("Gemini Image Edit Error:", error);
      throw error;
    }
  }
};
