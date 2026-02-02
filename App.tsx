
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS, NPC_ROLES } from './constants';
import { GameState, Message, DialogueProtocol } from './types';
import { generateNPCResponse } from './services/geminiService';
import { ambient } from './services/audioService';
import { Terminal, ShieldAlert, Send, RefreshCw, ChevronRight, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    lang: 'VI',
    phase: 'LOBBY',
    selectedNPCId: null,
    suspicion: 15,
    tension: 0,
    messages: [],
    isAccusing: false,
    result: null
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[state.lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, loading]);

  const handleStart = () => {
    ambient.start();
    setState(prev => ({ ...prev, phase: 'BRIEFING' }));
  };

  const selectNPC = (id: string) => {
    ambient.playSystemBlip();
    setState(prev => ({
      ...prev,
      phase: 'INTERACTION',
      selectedNPCId: id,
      messages: [{ role: 'system', text: `PROTOCOL_INIT: ${id.toUpperCase()}` }]
    }));
  };

  const handleSend = async (protocol: DialogueProtocol) => {
    if (!input.trim() || loading || !state.selectedNPCId) return;

    const currentNPC = NPC_ROLES.find(n => n.id === state.selectedNPCId);
    if (!currentNPC) return;

    const userText = input;
    setInput('');
    setLoading(true);
    ambient.playKeyClick();

    const userMsg: Message = { role: 'user', text: userText, protocol };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));

    try {
      const responseText = await generateNPCResponse(
        currentNPC,
        userText,
        protocol,
        state.suspicion,
        state.tension,
        state.messages,
        state.lang
      );
      
      let sImpact = 0, tImpact = 4;
      switch(protocol) {
        case 'TRUTH': sImpact = -6; break;
        case 'HALF_TRUTH': sImpact = 5; tImpact = 8; break;
        case 'LIE': sImpact = 18; tImpact = 12; break;
        case 'EMOTIONAL': sImpact = 10; tImpact = -5; break;
        case 'REDIRECT': sImpact = 8; tImpact = 6; break;
      }

      setState(prev => {
        const newSuspicion = Math.min(100, Math.max(0, prev.suspicion + sImpact));
        const newTension = Math.min(100, Math.max(0, prev.tension + tImpact));
        return {
          ...prev,
          suspicion: newSuspicion,
          tension: newTension,
          messages: [...prev.messages, { 
            role: 'model', 
            text: responseText, 
            bioStatus: newTension > 80 ? 'COLLAPSE' : newTension > 50 ? 'STRESS' : newSuspicion > 70 ? 'PUPIL' : 'STABLE'
          }]
        };
      });
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
      let result: 'WIN' | 'LOSE' | 'CHAOS';
      if (state.suspicion > 75) result = 'WIN';
      else if (state.suspicion > 45) result = 'CHAOS';
      else result = 'LOSE';
      setState(prev => ({ ...prev, phase: 'ENDGAME', result, isAccusing: false }));
    }, 2500);
  };

  const reset = () => {
    setState({
      lang: state.lang,
      phase: 'LOBBY',
      selectedNPCId: null,
      suspicion: 15,
      tension: 0,
      messages: [],
      isAccusing: false,
      result: null
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-[#f0f0f0] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-40 w-full animate-scan" />

      {/* Header */}
      <header className="flex-none h-16 border-b border-zinc-900 flex justify-between items-center px-6 bg-black z-40">
        <div className="flex items-center gap-3">
          <Terminal className="text-red-600" size={18} />
          <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">{t.subtitle}</span>
        </div>
        <button 
          onClick={() => setState(p => ({ ...p, lang: p.lang === 'VI' ? 'EN' : 'VI' }))}
          className="text-[10px] font-bold border border-zinc-800 px-4 py-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest active:scale-95"
        >
          {state.lang === 'VI' ? 'ENGLISH' : 'TIẾNG VIỆT'}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative flex flex-col min-h-0">
        {state.phase === 'LOBBY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-flicker">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 terminal-glow text-white">
              {t.title}
            </h1>
            <p className="text-zinc-600 text-[10px] tracking-[1em] uppercase mb-16 font-bold">{t.auth}</p>
            <button 
              onClick={handleStart}
              className="px-16 py-8 bg-white text-black font-black text-2xl uppercase hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
            >
              {t.btnStart}
            </button>
          </div>
        )}

        {state.phase === 'BRIEFING' && (
          <div className="flex-1 overflow-y-auto p-8 md:p-16 w-full max-w-6xl mx-auto custom-scrollbar animate-in">
            <h2 className="text-5xl font-black italic mb-12 border-l-8 border-red-600 pl-8 uppercase tracking-tighter text-white">{t.briefingTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {NPC_ROLES.map((npc) => (
                <div 
                  key={npc.id}
                  onClick={() => selectNPC(npc.id)}
                  className="group p-10 border-2 border-zinc-900 bg-zinc-950/40 hover:border-red-600 cursor-pointer transition-all flex flex-col h-full active:scale-[0.98]"
                >
                  <h3 className="text-3xl font-black mb-4 uppercase italic group-hover:text-red-500 transition-colors text-white">{npc.name[state.lang]}</h3>
                  <p className="text-sm text-zinc-500 font-bold mb-10 leading-relaxed">{npc.description[state.lang]}</p>
                  <div className="mt-auto flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-700 group-hover:text-white uppercase">
                    {t.selectSubject} <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.phase === 'INTERACTION' && state.selectedNPCId && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 border-t border-zinc-900 bg-black/40">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 border-r border-zinc-900 p-8 flex flex-col gap-10 bg-black shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                  <ShieldAlert size={16} className="text-red-600" /> {t.monitoring}
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {NPC_ROLES.find(n => n.id === state.selectedNPCId)?.name[state.lang]}
                </h2>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-500">
                    <span>{t.suspicion}</span>
                    <span className={state.suspicion > 70 ? 'text-red-500 animate-pulse' : ''}>{state.suspicion}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${state.suspicion}%` }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-500">
                    <span>{t.tension}</span>
                    <span className={state.tension > 60 ? 'text-yellow-500 animate-pulse' : ''}>{state.tension}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-700" style={{ width: `${state.tension}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={handleAccuse}
                  disabled={state.isAccusing || loading}
                  className="w-full py-6 border-2 border-red-600 text-white font-black text-xs uppercase hover:bg-red-600 transition-all flex items-center justify-center gap-4 disabled:opacity-20 active:scale-95"
                >
                  {state.isAccusing ? <RefreshCw className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                  {state.isAccusing ? t.accusing : t.accuse}
                </button>
              </div>
            </aside>

            {/* Interaction Feed */}
            <section className="flex-1 flex flex-col min-h-0 bg-zinc-950/20">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar scroll-smooth">
                {state.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'system' ? 'justify-center' : m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                    {m.role === 'system' ? (
                      <span className="text-[10px] text-zinc-600 border border-zinc-900 px-6 py-2 uppercase italic tracking-widest font-bold bg-black/40">{m.text}</span>
                    ) : (
                      <div className={`max-w-[85%] relative border-2 ${m.role === 'user' ? 'bg-white text-black border-zinc-200 p-6 md:p-8' : 'bg-zinc-900 border-zinc-800 p-8 md:p-10'}`}>
                        {m.role === 'model' && (
                          <div className="absolute -top-6 left-0 flex items-center gap-2 text-[9px] font-black text-red-500 bg-black border border-zinc-800 px-4 py-1 uppercase tracking-widest shadow-xl">
                            <Zap size={12} className="animate-pulse" /> BIO::{ t.bio[m.bioStatus || 'STABLE'] }
                          </div>
                        )}
                        <div className={`leading-tight font-black tracking-tighter ${m.role === 'user' ? 'text-2xl' : 'text-3xl md:text-5xl npc-glow text-white'}`}>
                          {m.text}
                        </div>
                        {m.protocol && m.role === 'user' && (
                          <div className="absolute -bottom-5 right-0 text-[9px] font-black text-zinc-700 uppercase italic opacity-40 tracking-widest">PROTOCOL::{m.protocol}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && <div className="text-center text-xs text-zinc-800 font-bold animate-pulse tracking-[0.5em] py-8 uppercase">{t.analyzing}</div>}
              </div>

              {/* Chat Input Overlay */}
              <div className="p-8 border-t border-zinc-900 bg-black/95 shrink-0 z-20">
                <div className="flex gap-6 mb-8 items-center">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || state.isAccusing}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent border-b-2 border-zinc-800 focus:border-red-600 outline-none pb-3 text-3xl font-black uppercase placeholder:text-zinc-900 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleSend('TRUTH')}
                  />
                  <button 
                    onClick={() => handleSend('TRUTH')}
                    disabled={!input.trim() || loading}
                    className="p-5 bg-white text-black hover:bg-red-600 hover:text-white transition-all transform active:scale-90 disabled:opacity-10 border-2 border-zinc-800"
                  >
                    <Send size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {(Object.keys(t.protocols) as DialogueProtocol[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSend(key)}
                      disabled={!input.trim() || loading || state.isAccusing}
                      className="group p-5 border-2 border-zinc-800 bg-zinc-950/80 hover:border-red-600 transition-all flex flex-col items-start relative overflow-hidden active:scale-95 disabled:opacity-20"
                    >
                      <span className="text-xs font-black uppercase italic mb-1 group-hover:text-red-500 transition-colors text-zinc-400 group-hover:text-white">{t.protocols[key].label}</span>
                      <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">{t.protocols[key].desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {state.phase === 'ENDGAME' && state.result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in z-50 bg-[#050505]">
            <h2 className={`text-6xl md:text-9xl font-black italic uppercase tracking-tighter mb-10 drop-shadow-2xl ${
              state.result === 'WIN' ? 'text-green-500' : state.result === 'CHAOS' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {state.result === 'WIN' ? t.resultWin : state.result === 'CHAOS' ? t.resultChaos : t.resultLose}
            </h2>
            <div className="bg-zinc-950/90 border-4 border-zinc-800 p-12 text-left max-w-4xl w-full mb-12 shadow-2xl">
               <p className="text-2xl md:text-4xl font-black italic border-l-8 border-red-600 pl-10 mb-12 text-zinc-200 leading-tight">
                 {state.result === 'WIN' ? t.winMsg : state.result === 'CHAOS' ? t.chaosMsg : t.loseMsg}
               </p>
               <div className="grid grid-cols-2 gap-10 text-[11px] font-black text-zinc-700 uppercase tracking-[0.4em]">
                  <div>INTEGRITY<div className="text-6xl text-white tracking-tighter font-black">{state.suspicion}%</div></div>
                  <div>TENSION<div className="text-6xl text-white tracking-tighter font-black">{state.tension}%</div></div>
               </div>
            </div>
            <button 
              onClick={reset}
              className="px-16 py-6 bg-white text-black font-black text-2xl uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-6 border-4 border-zinc-300 active:scale-95"
            >
              <RefreshCw size={28} /> {t.btnReset}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
