import { HfInference } from "@huggingface/inference";
import { retryWithBackoff } from "../utils/retry";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "";

let hf: HfInference | null = null;
if (HF_TOKEN) {
    hf = new HfInference(HF_TOKEN);
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

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    timeLimit: number; // in seconds
}

export interface QuizData {
    topic: string;
    difficulty: 'Easy' | 'Moderate' | 'Difficult';
    questions: QuizQuestion[];
}

export const generateInfographic = async (input: string): Promise<InfographicData | null> => {
    if (!HF_TOKEN || !hf) {
        console.warn("No Hugging Face Token provided. Using mock data.");
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock logic for non-educational check
                if (input.toLowerCase().includes("party") || input.toLowerCase().includes("game")) {
                    resolve(null);
                    return;
                }

                resolve({
                    title: "Photosynthesis (Mock)",
                    summary: "The process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.",
                    keyPoints: [
                        { title: "Light Absorption", description: "Chlorophyll absorbs solar energy.", iconType: "concept" },
                        { title: "Water Splitting", description: "Water molecules are split, releasing oxygen.", iconType: "process" },
                        { title: "Carbon Fixation", description: "CO2 is converted into glucose.", iconType: "process" },
                        { title: "Energy Storage", description: "Glucose stores chemical energy for the plant.", iconType: "fact" }
                    ],
                    funFact: "This is a mock response because no Hugging Face API key was found.",
                    isEducational: true
                });
            }, 1500);
        });
    }

    try {
        const prompt = `
      You are an educational AI assistant. Analyze the following input: "${input}".
      
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

      Return ONLY the raw JSON. Do not include markdown formatting like \`\`\`json.
    `;

        console.log("Sending request to HF...");
        try {
        const data = await retryWithBackoff(async () => {
            const response = await hf.chatCompletion({
                model: 'Qwen/Qwen2.5-72B-Instruct',
                messages: [
                    { role: "system", content: "You are a helpful educational AI assistant. You MUST output strictly valid JSON. Do not output any thinking or explanation before or after the JSON." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.7,
            });

            const text = response.choices[0].message.content || "";
            // console.log("Raw AI Response:", text); // Clean up log
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

            const parsed = JSON.parse(jsonString) as InfographicData;
            return parsed;
        });

        if (!data.isEducational) {
            return null;
        }
        return data;

        } catch (apiError) {
            console.warn("API Request Failed, falling back to offline mode:", apiError);

            // Fallback Generator for Demo Purposes
            return {
                title: input,
                summary: `(Offline Mode) A generated summary about ${input}. The AI service is currently unavailable, so this is a placeholder demonstration.`,
                keyPoints: [
                    { title: "Concept 1", description: `First key point about ${input}.`, iconType: "concept" },
                    { title: "Process", description: `How ${input} works in practice.`, iconType: "process" },
                    { title: "History", description: `Historical context of ${input}.`, iconType: "history" },
                    { title: "Impact", description: `Why ${input} matters today.`, iconType: "fact" }
                ],
                funFact: "Did you know? This content was generated locally because the external AI provider is experiencing high traffic.",
                isEducational: true
            };
        }

    } catch (error: unknown) {
        console.error("Critical error in AI service:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate infographic.");
    }
};

export const generateQuiz = async (topic: string, syllabus: string, difficulty: string): Promise<QuizData | null> => {
    if (!HF_TOKEN || !hf) {
        console.warn("No Hugging Face Token provided. Using mock data.");
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    topic,
                    difficulty: difficulty as 'Easy' | 'Moderate' | 'Difficult',
                    questions: Array(10).fill(null).map((_, i) => ({
                        question: `Mock Question ${i + 1} about ${topic} (${difficulty})`,
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctIndex: 0,
                        timeLimit: difficulty === 'Easy' ? 15 : difficulty === 'Moderate' ? 30 : 60
                    }))
                });
            }, 1500);
        });
    }

    console.log("Sending Quiz request to HF...");
    try {
        const prompt = `
      Generate a 10-question Multiple Choice Quiz.
      Topic: "${topic}"
      Syllabus/Context: "${syllabus}"
      Difficulty Level: "${difficulty}"

      Requirements:
      - Strictly valid JSON output.
      - Array of 10 objects.
      - Each object must have:
        - "question": The question text.
        - "options": Array of 4 strings.
        - "correctIndex": Integer (0-3) indicating the correct option.
        - "timeLimit": Integer (seconds) based on difficulty (${difficulty === 'Easy' ? '15' : difficulty === 'Moderate' ? '30' : '60'}).
      
      Do not include any markdown or explanation. Just the JSON array.
    `;

        const data = await retryWithBackoff(async () => {
            const response = await hf.chatCompletion({
                model: 'Qwen/Qwen2.5-72B-Instruct',
                messages: [
                    { role: "system", content: "You are a strict quiz generator. Output ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 2000,
                temperature: 0.7,
            });

            const text = response.choices[0].message.content || "";
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/); // Match array
            const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

            const questions = JSON.parse(jsonString) as QuizQuestion[];

            return {
                topic,
                difficulty: difficulty as 'Easy' | 'Moderate' | 'Difficult',
                questions
            };
        });

        return data;

    } catch (error: unknown) {
        console.error("Error generating quiz:", error);
        // Fallback Mock
        return {
            topic,
            difficulty: difficulty as 'Easy' | 'Moderate' | 'Difficult',
            questions: Array(10).fill(null).map((_, i) => ({
                question: `(Offline) Question ${i + 1} about ${topic}`,
                options: ["A", "B", "C", "D"],
                correctIndex: 0,
                timeLimit: 30
            }))
        };
    }
};
