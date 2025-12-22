import { GoogleGenerativeAI } from "@google/generative-ai";
import { retryWithBackoff, isRateLimitError } from "../utils/retry";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export interface InfographicPoint {
    title: string;
    description: string;
    iconType: 'concept' | 'process' | 'fact' | 'history';
}

export interface InfographicData {
    title: string;
    summary: string;
    keyPoints: InfographicPoint[];
    funFact: string;
    isEducational: boolean;
}

export const generateInfographic = async (input: string): Promise<InfographicData | null> => {
    if (!API_KEY || !genAI) {
        console.warn("No API Key provided. Using mock data.");
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock logic for non-educational check
                if (input.toLowerCase().includes("party") || input.toLowerCase().includes("game")) {
                    resolve(null);
                    return;
                }

                resolve({
                    title: "Photosynthesis",
                    summary: "The process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.",
                    keyPoints: [
                        { title: "Light Absorption", description: "Chlorophyll absorbs solar energy.", iconType: "concept" },
                        { title: "Water Splitting", description: "Water molecules are split, releasing oxygen.", iconType: "process" },
                        { title: "Carbon Fixation", description: "CO2 is converted into glucose.", iconType: "process" },
                        { title: "Energy Storage", description: "Glucose stores chemical energy for the plant.", iconType: "fact" }
                    ],
                    funFact: "The first photosynthetic organisms probably evolved early in the evolutionary history of life and most likely used reducing agents such as hydrogen or hydrogen sulfide, rather than water.",
                    isEducational: true
                });
            }, 1500);
        });
    }

    // Use gemini-1.5-flash for higher rate limits and faster responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following input: "${input}".
      
      First, determine if this input is educational or related to a study topic. 
      If it is NOT educational (e.g. "how to party", "video game cheat codes", "random gibberish"), return a JSON object with only {"isEducational": false}.
      
      If it IS educational, generate a structured infographic summary in JSON format with the following fields:
      - "isEducational": true
      - "title": A short, punchy title for the topic.
      - "summary": A 2-sentence summary of the core concept.
      - "keyPoints": An array of 4 distinct key concepts or steps. Each should have:
        - "title": Short subtitle.
        - "description": One clear sentence explaining it.
        - "iconType": Choose one of ["concept", "process", "fact", "history"] based on the content.
      - "funFact": One interesting, memorable fact about the topic.

      Return ONLY the raw JSON. No markdown formatting.
    `;

    try {
        // Use retry wrapper for the API call
        const data = await retryWithBackoff(async () => {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanText) as InfographicData;
        });

        if (!data.isEducational) {
            return null;
        }

        return data;

    } catch (error) {
        console.error("Error generating infographic:", error);
        if (isRateLimitError(error)) {
            throw new Error("Rate limit exceeded. Please try again in a few moments.");
        }
        throw new Error("Failed to generate infographic.");
    }
};
