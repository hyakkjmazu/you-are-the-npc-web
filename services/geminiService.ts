
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
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const LORE_DATABASE = `
    FINAL_DATABASE_OVERRIDE:
    - The Incident: An attempt to upload human consciousness to 'The Void'. It failed, leaving 'Ghosts' in the machine.
    - The Operator: You are not just a user, you are a digital exorcist.
    - The NPCs: They are fragments of the original architect's soul, hiding the 'Core Keys'.

    SPECIFIC_DATA:
    - Shopkeeper: His ledger contains the encryption keys for the city's air filtration.
    - Guard: His 'Family' never existed; they were part of his training simulation.
    - Widow: She is the only real human left, trapped in a neural loop.
  `;

  const instruction = `
    ${SYSTEM_PROMPT}
    ${LORE_DATABASE}
    LANGUAGE: ${language === 'VI' ? 'Vietnamese' : 'English'}
    MODEL_PROFILE: You are now using HIGH-PRECISION logic (Gemini 3 Pro).
    If the user is inconsistent, call them out. If they use logic, respond with emotion. If they use emotion, respond with cold logic.
    Current System Integrity: HACKED.
    NPC_NAME: ${npc.name[language]}
    TARGET_DATA: ${npc.secretObjective[language]}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history
          .filter(h => h.role !== 'system')
          .map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `[QUERY]: ${userMessage} [PROTOCOL]: ${protocol} [SYSTEM_TENSION]: ${globalTension}` }] }
      ],
      config: {
        systemInstruction: instruction,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 } // Tận dụng khả năng suy nghĩ sâu của model Pro
      }
    });

    return response.text || "...";
  } catch (error: any) {
    console.error("Gemini Pro Engine Error:", error);
    throw error;
  }
};
