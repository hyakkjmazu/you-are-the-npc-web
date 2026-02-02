
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { DialogueProtocol, NPCRole, Language } from "../types";

export const generateNPCResponse = async (
  npc: NPCRole,
  userMessage: string,
  protocol: DialogueProtocol,
  currentSuspicion: number,
  globalTension: number,
  history: { role: 'user' | 'model' | 'system', text: string }[],
  language: Language
) => {
  // Always initialize inside the function to get the latest process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const instruction = `
    ${SYSTEM_PROMPT}
    PREFERRED_LANGUAGE: ${language === 'VI' ? 'Vietnamese' : 'English'}
    ROLE_NAME: ${npc.name[language]}
    PERSONALITY: ${npc.personality[language]}
    SECRET_OBJECTIVE: ${npc.secretObjective[language]}
    PROTOCOL_APPLIED: ${protocol}
    CURRENT_SUSPICION: ${currentSuspicion}/100
    CURRENT_TENSION: ${globalTension}/100
    
    CRITICAL: Always keep responses under 2 sentences. Use a dramatic, cold, and terminal-like tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history
          .filter(h => h.role !== 'system')
          .map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `[INPUT]: ${userMessage}\n[PROTOCOL]: ${protocol}` }] }
      ],
      config: {
        systemInstruction: instruction,
        temperature: 0.9,
        topP: 0.95,
      }
    });

    // Use .text property directly as per guidelines
    return response.text || (language === 'VI' ? "..." : "...");
  } catch (error: any) {
    console.error("AI Interlink Failure:", error);
    // Return a themed error message instead of failing
    return language === 'VI' 
      ? "[LỖI KẾT NỐI]: ĐỐI TƯỢNG ĐANG CHỐNG ĐỐI TRUY CẬP." 
      : "[LINK_FAILURE]: SUBJECT IS RESISTING ACCESS.";
  }
};