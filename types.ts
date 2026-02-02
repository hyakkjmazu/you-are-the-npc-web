
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
  bioStatus?: 'STABLE' | 'STRESS' | 'PUPIL' | 'COLLAPSE';
}

export interface GameState {
  lang: Language;
  phase: 'LOBBY' | 'BRIEFING' | 'INTERACTION' | 'ENDGAME';
  selectedNPCId: string | null;
  suspicion: number;
  tension: number;
  messages: Message[];
  isAccusing: boolean;
  result: 'WIN' | 'LOSE' | 'CHAOS' | null;
}
