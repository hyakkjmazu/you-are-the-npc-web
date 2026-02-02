
export type Language = 'VI' | 'EN';

export type DialogueProtocol = 'TRUTH' | 'HALF_TRUTH' | 'LIE' | 'REDIRECT' | 'EMOTIONAL';

export interface NPCRole {
  id: string;
  name: Record<Language, string>;
  personality: Record<Language, string>;
  description: Record<Language, string>;
  secretObjective: Record<Language, string>;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  protocol?: DialogueProtocol;
  bioStatus?: 'STABLE' | 'STRESS' | 'PUPIL' | 'COLLAPSE' | 'CORRUPTED';
}

export type EndingType = 'SHOPKEEPER' | 'GUARD' | 'WIDOW' | 'NONE' | 'VOID_COLLAPSE';

export interface GameState {
  lang: Language;
  phase: 'LOBBY' | 'INTRO' | 'BRIEFING' | 'INTERACTION' | 'ENDGAME';
  selectedNPCId: string | null;
  suspicion: number;
  tension: number;
  resistance: number;
  mentalShield: number;
  syncRate: number;
  entropy: number; // Mới: Độ hỗn loạn của hệ thống
  isDeepDive: boolean; // Mới: Trạng thái thâm nhập sâu
  messages: Message[];
  isAccusing: boolean;
  result: EndingType | null;
  isBroken: boolean;
  discoveredFragments: string[];
  interrogationStyle: string[];
}
