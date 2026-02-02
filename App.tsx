
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS, NPC_ROLES } from './constants';
import { GameState, Message, DialogueProtocol, EndingType } from './types';
import { generateNPCResponse } from './services/geminiService';
import { ambient } from './services/audioService';
import { ShieldAlert, Send, RefreshCw, ChevronRight, Activity, Radio, ClipboardCheck, Lock, Zap, Eye, Ghost } from 'lucide-react';

const INITIAL_STATE: GameState = {
  lang: 'VI',
  phase: 'LOBBY',
  selectedNPCId: null,
  suspicion: 5,
  tension: 5,
  resistance: 60,
  mentalShield: 100,
  syncRate: 10,
  entropy: 0,
  isDeepDive: false,
  messages: [],
  isAccusing: false,
  result: null,
  isBroken: false,
  discoveredFragments: [],
  interrogationStyle: []
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [shake, setShake] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[state.lang] || TRANSLATIONS['EN'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [state.messages, loading]);

  // Logic v4.0: Entropy và Deep Dive
  useEffect(() => {
    let interval: number;
    if (state.phase === 'INTERACTION' && !loading) {
      interval = window.setInterval(() => {
        setState(prev => {
          const newEntropy = Math.min(100, prev.entropy + 0.1);
          if (newEntropy > 95 && !prev.isAccusing) {
             // Tự động ép kết thúc nếu Entropy quá cao
             // trigger kết thúc thảm khốc
          }
          return {
            ...prev,
            entropy: newEntropy,
            resistance: Math.min(100, prev.resistance + 0.3),
            mentalShield: Math.min(100, prev.mentalShield + 0.1)
          };
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [state.phase, loading]);

  const handleStart = () => {
    ambient.start();
    setState(prev => ({ ...prev, phase: 'INTRO' }));
  };

  const selectNPC = (id: string) => {
    ambient.playSystemBlip();
    setState({
      ...INITIAL_STATE,
      lang: state.lang,
      phase: 'INTERACTION',
      selectedNPCId: id,
      messages: [{ role: 'system', text: `SYSTEM_REBOOT::NEURAL_SIEGE_v4.0::INJECTING_CONSCIOUSNESS::SUBJECT_${id.toUpperCase()}` }]
    });
  };

  const getWhisper = () => {
    if (state.entropy > 80) return "WARNING: SYSTEM ENTROPY CRITICAL. REALITY COLLAPSING.";
    if (state.isDeepDive) return "NEURAL LINK STABLE. ACCESSING CORE MEMORIES.";
    if (state.mentalShield > 80) return t.whispers?.shieldHigh;
    return t.whispers?.default;
  };

  // Fix: Adding the missing getShieldDesc function used in line 289 to describe mental shield status.
  const getShieldDesc = () => {
    if (state.mentalShield >= 80) return t.shieldStatus?.high;
    if (state.mentalShield >= 40) return t.shieldStatus?.mid;
    if (state.mentalShield > 0) return t.shieldStatus?.low;
    return t.shieldStatus?.broken;
  };

  const handleSend = async (protocol: DialogueProtocol) => {
    if (!input.trim() || loading || !state.selectedNPCId || state.isBroken) return;

    const currentNPC = NPC_ROLES.find(n => n.id === state.selectedNPCId);
    if (!currentNPC) return;

    const query = input;
    const userText = input.toLowerCase();
    setInput('');
    setLoading(true);
    ambient.playKeyClick();

    const clues = {
      shopkeeper: ['sổ nợ', 'ledger', 'phản bội', 'đối tác', 'tiền', 'mảnh vỡ'],
      guard: ['nhẫn', 'vợ', 'gia đình', 'giết', 'sát nhân', 'mô phỏng'],
      widow: ['tầng hầm', 'thứ đó', 'sự cố', 'ánh sáng', 'ma', 'vòng lặp']
    };
    
    const matchedClue = clues[currentNPC.id as keyof typeof clues]?.find(c => userText.includes(c));

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, { role: 'user', text: query, protocol }],
      interrogationStyle: [...prev.interrogationStyle, protocol]
    }));

    try {
      const responseText = await generateNPCResponse(
        currentNPC,
        query,
        protocol,
        state.suspicion,
        state.tension,
        state.messages,
        state.lang
      );
      
      let sGain = matchedClue ? 10 : 2; 
      let tGain = 3;
      let rGain = matchedClue ? -15 : 5;
      let shieldDamage = matchedClue ? 30 : 2;

      // Entropy tăng theo mỗi câu hỏi
      const entropyGain = 1.5;

      const isBreak = state.mentalShield < 15 && state.suspicion > 80 && matchedClue !== undefined;

      setState(prev => {
        const nextShield = Math.max(0, prev.mentalShield - shieldDamage);
        return {
          ...prev,
          suspicion: Math.min(100, prev.suspicion + sGain),
          tension: Math.min(100, prev.tension + tGain),
          resistance: Math.min(100, Math.max(0, prev.resistance + rGain)),
          mentalShield: nextShield,
          entropy: Math.min(100, prev.entropy + entropyGain),
          isDeepDive: nextShield < 25,
          isBroken: isBreak,
          discoveredFragments: matchedClue && !prev.discoveredFragments.includes(matchedClue) ? [...prev.discoveredFragments, matchedClue] : prev.discoveredFragments,
          messages: [...prev.messages, { 
            role: 'model', 
            text: responseText, 
            bioStatus: isBreak ? 'COLLAPSE' : prev.tension > 85 ? 'STRESS' : 'STABLE'
          }]
        };
      });

      if (!matchedClue) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      } else {
        ambient.playSystemBlip();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccuse = () => {
    setState(prev => ({ ...prev, isAccusing: true }));
    ambient.playSystemBlip();
    setTimeout(() => {
      let result: EndingType = 'NONE';
      if (state.entropy > 90) result = 'VOID_COLLAPSE';
      else if (state.mentalShield < 10 && state.suspicion > 85) {
        if (state.selectedNPCId === 'shopkeeper') result = 'SHOPKEEPER';
        else if (state.selectedNPCId === 'guard') result = 'GUARD';
        else if (state.selectedNPCId === 'widow') result = 'WIDOW';
      }
      setState(prev => ({ ...prev, phase: 'ENDGAME', result, isAccusing: false }));
    }, 3000);
  };

  return (
    <div className={`flex flex-col h-full w-full bg-black text-terminal-text font-mono overflow-hidden relative ${state.isDeepDive ? 'void-shift' : ''} ${glitch ? 'animate-noise' : ''}`}>
      {/* Visual Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_3px,4px_100%] opacity-30" />
      <div className="absolute inset-0 pointer-events-none z-0 neural-grid opacity-20" />

      <header className="flex-none h-14 border-b border-zinc-900 flex justify-between items-center px-8 bg-black/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">System_Entropy</div>
            <div className="w-48 h-1 bg-zinc-900 mt-1">
              <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${state.entropy}%` }} />
            </div>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3">
             <Activity size={14} className={state.entropy > 70 ? 'text-red-600 animate-pulse' : 'text-green-600'} />
             INTEGRITY: {(100 - state.entropy).toFixed(1)}%
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setState(p => ({ ...p, lang: p.lang === 'VI' ? 'EN' : 'VI' }))} className="text-[10px] font-black hover:text-red-500 transition-colors">[{state.lang}]</button>
           <div className="text-zinc-800 font-black text-[10px]">v4.0_FINAL</div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        {state.phase === 'LOBBY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 bg-black">
            <h1 className="text-8xl md:text-[12rem] font-black italic tracking-tighter uppercase terminal-glow text-white mb-2 leading-none">
              {t.title}
            </h1>
            <div className="flex gap-4 mb-20 animate-pulse">
               <Ghost size={20} className="text-red-600" />
               <span className="text-red-600 text-[11px] font-black tracking-[1.5em] uppercase">Digital_Exorcism_Protocol</span>
            </div>
            <button onClick={handleStart} className="group relative px-24 py-8 border-2 border-red-600 text-red-600 font-black text-3xl uppercase transition-all overflow-hidden hover:bg-red-600 hover:text-white active:scale-95">
              <span className="relative z-10">{t.btnStart}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}

        {state.phase === 'INTRO' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-20 bg-black">
            <div className="max-w-4xl space-y-10">
              {t.worldIntro?.map((line: string, i: number) => (
                <p key={i} className="text-3xl md:text-5xl font-black italic text-zinc-800 uppercase leading-[0.9] tracking-tighter animate-in" style={{ animationDelay: `${i * 1}s` }}>
                  {line}
                </p>
              ))}
              <button onClick={() => setState(prev => ({ ...prev, phase: 'BRIEFING' }))} className="mt-20 flex items-center gap-6 text-red-600 hover:text-white font-black uppercase text-[14px] tracking-[1em] transition-all group">
                IDENTIFY_TARGETS <ChevronRight size={24} className="group-hover:translate-x-4 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {state.phase === 'BRIEFING' && (
          <div className="flex-1 overflow-y-auto p-16 w-full max-w-7xl mx-auto animate-in space-y-20">
            <div className="border-l-8 border-red-600 pl-8">
              <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">{t.briefingTitle}</h2>
              <p className="text-zinc-600 text-xs font-black tracking-[0.5em] uppercase">Sub-System: Neural_Profiling</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {NPC_ROLES.map((npc) => (
                <div key={npc.id} onClick={() => selectNPC(npc.id)} className="group relative p-12 border-2 border-zinc-900 bg-zinc-950/20 hover:border-red-600 cursor-pointer transition-all flex flex-col hover:bg-red-600/5 active:scale-95">
                  <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-zinc-800 group-hover:border-red-600" />
                  <h3 className="text-5xl font-black mb-6 uppercase italic text-zinc-600 group-hover:text-white transition-colors leading-none tracking-tighter">{npc.name[state.lang]}</h3>
                  <p className="text-[13px] text-zinc-500 font-bold mb-16 uppercase leading-relaxed group-hover:text-zinc-300">{npc.description[state.lang]}</p>
                  <div className="mt-auto flex items-center justify-between text-[10px] font-black text-zinc-800 uppercase group-hover:text-red-500">
                    <span>STATUS: ENCRYPTED</span>
                    <Zap size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.phase === 'INTERACTION' && state.selectedNPCId && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <aside className="w-full lg:w-[28rem] border-r border-zinc-900 p-12 flex flex-col gap-16 shrink-0 bg-black/40 backdrop-blur-xl relative z-10">
              <div className="space-y-4">
                <div className="text-[10px] text-red-700 font-black uppercase tracking-[0.5em] flex items-center gap-3"><Eye size={14}/> Target_Profile</div>
                <h2 className="text-6xl font-black italic uppercase text-white leading-none tracking-tighter">
                  {NPC_ROLES.find(n => n.id === state.selectedNPCId)?.name[state.lang]}
                </h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase text-blue-500">
                      <div className="flex items-center gap-3"><Lock size={14}/> {t.mentalShield}</div>
                      <span>{state.mentalShield.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-900 p-0.5 border border-zinc-800">
                      <div className="bg-blue-600 h-full transition-all duration-700 shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ width: `${state.mentalShield}%` }} />
                    </div>
                    <div className={`text-[10px] font-black uppercase italic animate-flicker ${state.isDeepDive ? 'text-purple-500' : 'text-zinc-600'}`}>
                      {state.isDeepDive ? ">>> CORE_EXPOSED: DEEP_DIVE_ACTIVE" : getShieldDesc()}
                    </div>
                  </div>

                <div className="grid grid-cols-1 gap-8">
                  {[
                    { label: t.suspicion, val: state.suspicion, color: 'bg-red-600' },
                    { label: t.tension, val: state.tension, color: 'bg-white' },
                    { label: t.resistance, val: state.resistance, color: 'bg-zinc-600' }
                  ].map((m, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                        <span>{m.label}</span>
                        <span className="text-white">{m.val.toFixed(0)}</span>
                      </div>
                      <div className="h-1 bg-zinc-900">
                        <div className={`${m.color} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/30 border border-zinc-900 p-8">
                <div className="text-[10px] font-black text-red-900 uppercase mb-6 flex items-center justify-between">
                  <span>Neural_Activity_Logs</span>
                  <Radio size={12} className="animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  {state.messages.filter(m => m.role === 'user').map((m, i) => (
                    <div key={i} className="text-[9px] text-zinc-700 font-bold uppercase border-l-2 border-zinc-800 pl-4 py-1">
                      Query_{i}: {m.protocol} // {m.text.slice(0, 30)}...
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAccuse}
                disabled={state.isAccusing || loading || (state.mentalShield > 20 && state.entropy < 90)}
                className="w-full py-8 border-4 border-red-900 text-red-900 font-black text-[14px] uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-6 disabled:opacity-10 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-600 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-4">
                  {state.isAccusing ? <RefreshCw className="animate-spin" size={20} /> : <ShieldAlert size={20} />}
                  {state.isAccusing ? t.accusing : t.accuse}
                </span>
              </button>
            </aside>

            <section className="flex-1 flex flex-col min-h-0 bg-[#020202] relative">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-16 space-y-24 custom-scrollbar">
                {state.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'system' ? 'justify-center' : m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                    {m.role === 'system' ? (
                      <span className="text-[11px] text-zinc-800 border-2 border-zinc-900 px-10 py-5 uppercase italic tracking-[1.2em] bg-black/50 backdrop-blur-sm shadow-2xl">{m.text}</span>
                    ) : (
                      <div className={`max-w-[80%] relative group ${m.role === 'user' ? 'bg-white text-black p-8' : 'bg-transparent border-l-[12px] border-red-600 pl-16 py-6'}`}>
                        {m.role === 'model' && (
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-px bg-red-600" />
                        )}
                        <div className={`font-black ${m.role === 'user' ? 'text-3xl uppercase leading-none tracking-tight' : 'text-5xl md:text-7xl text-white uppercase italic leading-[0.95] npc-glow tracking-tighter'}`}>
                          {m.text}
                        </div>
                        {m.protocol && (
                          <div className="absolute -top-5 right-0 text-[9px] font-black text-white bg-red-600 px-5 py-1.5 uppercase tracking-widest">
                            PROTOCOL::{m.protocol}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                   <div className="flex flex-col items-center gap-10 py-20 opacity-40">
                     <div className="flex gap-4">
                       {[0, 1, 2].map(n => <div key={n} className="w-4 h-4 bg-red-600 animate-pulse" style={{animationDelay: `${n * 0.2}s`}} />)}
                     </div>
                     <div className="text-[14px] text-zinc-700 font-black tracking-[2em] uppercase animate-pulse">Neural_Overwrite_In_Progress</div>
                   </div>
                )}
              </div>

              <div className="p-12 border-t border-zinc-900 bg-black/90 backdrop-blur-2xl">
                <div className="mb-6 text-[11px] font-black text-red-800 uppercase italic flex items-center justify-between whisper-glow">
                  <div className="flex items-center gap-3"><Zap size={14} /> {getWhisper()}</div>
                  <div className="text-zinc-700 tracking-[0.4em]">SYNC_MODE_v4</div>
                </div>
                <div className={`flex gap-10 mb-10 transition-all ${shake ? 'animate-shake' : ''}`}>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || state.isBroken}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent border-b-8 border-zinc-900 focus:border-red-600 outline-none pb-8 text-5xl font-black uppercase placeholder:text-zinc-900 text-white transition-all tracking-tighter input-focus-ring"
                    onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleSend('TRUTH')}
                  />
                  <button onClick={() => handleSend('TRUTH')} disabled={!input.trim() || loading} className="p-8 text-zinc-800 hover:text-red-600 transition-all transform hover:scale-110">
                    <Send size={48} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-6">
                  {t.protocols && (Object.keys(t.protocols) as DialogueProtocol[]).map((key) => (
                    <button key={key} onClick={() => handleSend(key)} disabled={!input.trim() || loading} className="group relative px-10 py-4 border-2 border-zinc-900 bg-zinc-950/50 hover:border-red-900 transition-all active:scale-95">
                      <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="text-[11px] font-black text-zinc-700 uppercase group-hover:text-white transition-colors tracking-widest">{t.protocols[key]?.label}</div>
                      <div className="text-[8px] text-zinc-800 group-hover:text-red-900 uppercase font-bold mt-1">{t.protocols[key]?.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {state.phase === 'ENDGAME' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-16 z-[200] bg-black animate-in overflow-y-auto custom-scrollbar">
            <h2 className="text-8xl md:text-[14rem] font-black italic uppercase text-red-700 mb-16 text-center terminal-glow leading-none tracking-tighter glitch-text" data-text={state.result === 'VOID_COLLAPSE' ? "VOID_ERROR" : (state.result ? t.endings?.[state.result]?.title : t.endings?.NONE?.title)}>
              {state.result === 'VOID_COLLAPSE' ? "VOID_ERROR" : (state.result ? t.endings?.[state.result]?.title : t.endings?.NONE?.title)}
            </h2>
            
            <div className="max-w-6xl w-full space-y-16">
              <div className="bg-zinc-900/10 border-l-[16px] border-red-700 p-16 text-left backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-zinc-800 font-black text-6xl opacity-10 uppercase">CONFIDENTIAL</div>
                <div className="flex items-center gap-6 mb-12 text-red-600">
                  <ClipboardCheck size={32} />
                  <span className="text-[18px] font-black uppercase tracking-[1em]">{t.analysisHeader}</span>
                </div>
                <p className="text-2xl md:text-4xl font-black text-zinc-300 uppercase leading-tight italic tracking-tight">
                  {state.result === 'VOID_COLLAPSE' ? "Hệ thống sụp đổ hoàn toàn. Operator bị kẹt trong hư không vĩnh viễn." : (state.result ? t.endings?.[state.result]?.analysis : t.endings?.NONE?.analysis)}
                </p>
                <div className="mt-16 pt-12 border-t border-zinc-800/50 flex gap-16 text-[12px] font-black text-zinc-600 uppercase tracking-widest">
                  <div>SYNC_PRECISION: {state.syncRate}%</div>
                  <div>NEURAL_IMPRINT: {state.discoveredFragments.length} CLUES</div>
                  <div>FINAL_ENTROPY: {state.entropy.toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-zinc-950 border-t-[12px] border-red-600 p-20 text-left shadow-[0_0_150px_rgba(220,38,38,0.2)]">
                 <p className="text-4xl md:text-6xl font-black italic text-white uppercase leading-[0.9] mb-16 tracking-tighter">
                   {state.result === 'VOID_COLLAPSE' ? "Dữ liệu bị xóa sạch. Không còn thực tại để trở về." : (state.result ? t.endings?.[state.result]?.msg : t.endings?.NONE?.msg)}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-[12px] font-black text-zinc-700 uppercase pt-16 border-t border-zinc-900">
                    <div>SUSPICION_LVL: <span className="text-red-600 block text-3xl mt-2">{state.suspicion.toFixed(0)}</span></div>
                    <div>TENSION_PEAK: <span className="text-white block text-3xl mt-2">{state.tension.toFixed(0)}</span></div>
                    <div>SHIELD_BREACH: <span className="text-blue-600 block text-3xl mt-2">{(100 - state.mentalShield).toFixed(0)}%</span></div>
                    <div>SYSTEM_STAMP: <span className="text-zinc-500 block text-3xl mt-2">v4_OMEGA</span></div>
                 </div>
              </div>
            </div>

            <button onClick={() => window.location.reload()} className="mt-24 px-24 py-10 border-4 border-zinc-800 text-zinc-600 font-black text-2xl uppercase hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-10 active:scale-95 group">
              <RefreshCw size={32} className="group-hover:rotate-180 transition-transform duration-700" /> 
              SYSTEM_PURGE_FINAL
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
