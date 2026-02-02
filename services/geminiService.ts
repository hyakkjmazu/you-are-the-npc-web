
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { DialogueProtocol, NPCRole, Language } from "../types";

export const generateNPCResponse = async (
  npc: NPCRole,
  userMessage: string,
  cardType: DialogueProtocol,
  currentSuspicion: number,
  globalTension: number,
  history: { role: 'user' | 'model' | 'system', text: string }[],
  language: Language
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const instruction = `
    ${SYSTEM_PROMPT}
    PREFERRED_LANGUAGE: ${language === 'VI' ? 'Vietnamese' : 'English'}
    ROLE_NAME: ${npc.name[language]}
    PERSONALITY: ${npc.personality[language]}
    SECRET_OBJECTIVE: ${npc.secretObjective[language]}
    PROTOCOL_APPLIED: ${cardType}
    CURRENT_SUSPICION: ${currentSuspicion}/100
    CURRENT_TENSION: ${globalTension}/100
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history
          .filter(h => h.role !== 'system')
          .map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `[Hero Input]: ${userMessage}\n[Protocol]: ${cardType}` }] }
      ],
      config: {
        systemInstruction: instruction,
        temperature: 0.8,
      }
    });

    return response.text?.trim() || (language === 'VI' ? "..." : "...");
  } catch (error: any) {
    console.error("AI Error:", error);
    return language === 'VI' ? "Đối tượng giữ im lặng đầy ẩn ý." : "Subject remains silent.";
  }
};
