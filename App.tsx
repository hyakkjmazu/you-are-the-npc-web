
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS, NPC_ROLES } from './constants';
import { GameState, Message, DialogueProtocol } from './types';
import { generateNPCResponse } from './services/geminiService';
import { ambient } from './services/audioService';
import { Terminal, ShieldAlert, Send, RefreshCw, Zap, Activity, Eye, Ghost } from 'lucide-react';

const INITIAL_STATE: GameState = {
  lang: 'VI',
  phase: 'LOBBY',
  selectedNPCId: null,
  suspicion: 15,
  tension: 10,
  messages: [],
  isAccusing: false,
  result: null
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[state.lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [state.messages, loading]);

  const handleStart = () => {
    ambient.start();
    setState(prev => ({ ...prev, phase: 'BRIEFING' }));
  };

  const resetGame = () => {
    ambient.playSystemBlip();
    setState({
      ...INITIAL_STATE,
      lang: state.lang // Giữ lại ngôn ngữ người dùng đã chọn
    });
  };

  const selectNPC = (id: string) => {
    ambient.playSystemBlip();
    setState(prev => ({
      ...prev,
      phase: 'INTERACTION',
      selectedNPCId: id,
      messages: [{ role: 'system', text: `ESTABLISHING SECURE LINK... SUBJECT_${id.toUpperCase()} CONNECTED.` }]
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
        case 'TRUTH': sImpact = -6; tImpact = 2; break;
        case 'HALF_TRUTH': sImpact = 4; tImpact = 8; break;
        case 'LIE': sImpact = 18; tImpact = 12; break;
        case 'EMOTIONAL': sImpact = 8; tImpact = -6; break;
        case 'REDIRECT': sImpact = 6; tImpact = 4; break;
      }

      setState(prev => {
        const newS = Math.min(100, Math.max(0, prev.suspicion + sImpact));
        const newT = Math.min(100, Math.max(0, prev.tension + tImpact));
        return {
          ...prev,
          suspicion: newS,
          tension: newT,
          messages: [...prev.messages, { 
            role: 'model', 
            text: responseText, 
            bioStatus: newT > 80 ? 'COLLAPSE' : newT > 50 ? 'STRESS' : newS > 70 ? 'PUPIL' : 'STABLE'
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

  return (
    <div className={`flex flex-col h-full w-full bg-terminal-bg text-terminal-text font-mono overflow-hidden relative ${state.tension > 85 ? 'animate-pulse bg-red-950/10' : ''}`}>
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,255,0,0.02))] bg-[length:100%_4px,3px_100%]" />
      
      <header className="flex-none h-16 border-b border-zinc-900 flex justify-between items-center px-8 bg-black/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center rounded-sm">
            <Terminal size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase">OS://SURVEILLANCE_v1.3</div>
            <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none">STATUS: ENCRYPTED_LINK_ACTIVE</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setState(p => ({ ...p, lang: p.lang === 'VI' ? 'EN' : 'VI' }))}
            className="text-[10px] font-bold border border-zinc-800 px-4 py-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest active:scale-95"
          >
            {state.lang === 'VI' ? 'ENGLISH' : 'TIẾNG VIỆT'}
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        {state.phase === 'LOBBY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-flicker z-10">
            <div className="mb-8 relative">
              <div className="absolute -inset-4 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase terminal-glow text-white relative">
                {t.title}
              </h1>
            </div>
            <p className="text-zinc-700 text-[10px] tracking-[1em] uppercase mb-16 font-bold max-w-md leading-loose">
              {t.auth} <br/> <span className="text-zinc-500 text-[8px]">[ ACCESS_POINT: TERMINAL_ALPHA_9 ]</span>
            </p>
            <button 
              onClick={handleStart}
              className="group relative px-20 py-8 bg-white text-black font-black text-2xl uppercase overflow-hidden hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
            >
              <span className="relative z-10">{t.btnStart}</span>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}

        {state.phase === 'BRIEFING' && (
          <div className="flex-1 overflow-y-auto p-12 w-full max-w-6xl mx-auto custom-scrollbar animate-in">
            <div className="flex items-end justify-between mb-12 border-b border-zinc-900 pb-6">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{t.briefingTitle}</h2>
              <span className="text-[10px] text-zinc-600 font-mono">COUNT: 03_TARGETS</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {NPC_ROLES.map((npc) => (
                <div 
                  key={npc.id}
                  onClick={() => selectNPC(npc.id)}
                  className="group relative p-10 border border-zinc-800 bg-zinc-950/40 hover:border-red-600 cursor-pointer transition-all flex flex-col h-full active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Activity size={40} className="text-red-600" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 uppercase italic group-hover:text-red-500 transition-colors text-white">{npc.name[state.lang]}</h3>
                  <p className="text-xs text-zinc-500 font-bold mb-10 leading-relaxed uppercase tracking-wide">{npc.description[state.lang]}</p>
                  <div className="mt-auto flex items-center justify-between text-[9px] font-black tracking-widest text-zinc-700 group-hover:text-white uppercase border-t border-zinc-900 pt-6">
                    INTAKE_PROTOCOL <ShieldAlert size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.phase === 'INTERACTION' && state.selectedNPCId && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <aside className="w-full lg:w-80 border-r border-zinc-900 p-8 flex flex-col gap-12 bg-black/60 shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  <Eye size={16} className="text-red-600" /> {t.monitoring}
                </div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {NPC_ROLES.find(n => n.id === state.selectedNPCId)?.name[state.lang]}
                </h2>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <span>{t.suspicion}</span>
                    <span className={state.suspicion > 75 ? 'text-red-500 animate-pulse' : 'text-white'}>{state.suspicion}%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-sm overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${state.suspicion}%` }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <span>{t.tension}</span>
                    <span className={state.tension > 60 ? 'text-yellow-500' : 'text-white'}>{state.tension}%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-sm overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${state.tension}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Ghost size={16} className="text-zinc-600" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Subconscious_State</span>
                </div>
                <div className={`text-xl font-black uppercase italic ${state.tension > 70 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                  { [...state.messages].reverse().find(m => m.role === 'model')?.bioStatus || 'STABLE' }
                </div>
              </div>

              <button 
                onClick={handleAccuse}
                disabled={state.isAccusing || loading}
                className="mt-auto w-full py-6 bg-red-600 text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 disabled:opacity-20 active:scale-95 shadow-lg shadow-red-900/20"
              >
                {state.isAccusing ? <RefreshCw className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                {state.isAccusing ? t.accusing : t.accuse}
              </button>
            </aside>

            <section className="flex-1 flex flex-col min-h-0 bg-black/20">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 lg:p-16 space-y-16 custom-scrollbar scroll-smooth">
                {state.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'system' ? 'justify-center' : m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                    {m.role === 'system' ? (
                      <span className="text-[10px] text-zinc-600 border border-zinc-900 px-8 py-2 uppercase italic tracking-widest font-bold bg-zinc-950/80">{m.text}</span>
                    ) : (
                      <div className={`max-w-[90%] lg:max-w-[70%] relative border-l-4 ${m.role === 'user' ? 'bg-white text-black border-zinc-300 p-6 md:p-8' : 'bg-zinc-900/60 border-red-600 p-10'}`}>
                        {m.role === 'model' && (
                          <div className="absolute -top-6 left-0 flex items-center gap-3 text-[10px] font-black text-red-500 bg-black border border-zinc-800 px-4 py-1.5 uppercase tracking-widest shadow-2xl">
                            <Zap size={14} className="animate-pulse" /> BIO_ALERT::{ t.bio[m.bioStatus || 'STABLE'] }
                          </div>
                        )}
                        <div className={`leading-[1.1] font-black tracking-tighter ${m.role === 'user' ? 'text-2xl uppercase' : 'text-3xl md:text-5xl npc-glow text-white uppercase italic'}`}>
                          {m.text}
                        </div>
                        {m.protocol && m.role === 'user' && (
                          <div className="absolute -bottom-6 right-0 text-[10px] font-black text-zinc-700 uppercase italic opacity-60 tracking-[0.3em]">
                            MODE::{m.protocol}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-4 text-xs text-zinc-800 font-bold animate-pulse tracking-[0.8em] py-12 uppercase justify-center">
                    <RefreshCw className="animate-spin" size={14} /> {t.analyzing}
                  </div>
                )}
              </div>

              <div className="p-8 lg:p-12 border-t border-zinc-900 bg-black/95 z-20">
                <div className="flex gap-6 mb-10 items-center">
                  <div className="text-red-600 text-lg font-bold">>>></div>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || state.isAccusing}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent border-b border-zinc-800 focus:border-red-600 outline-none pb-4 text-3xl font-black uppercase placeholder:text-zinc-900 text-white transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleSend('TRUTH')}
                  />
                  <button 
                    onClick={() => handleSend('TRUTH')}
                    disabled={!input.trim() || loading}
                    className="p-6 bg-white text-black hover:bg-red-600 hover:text-white transition-all transform active:scale-90 disabled:opacity-10 shadow-xl border border-zinc-800"
                  >
                    <Send size={32} />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  {(Object.keys(t.protocols) as DialogueProtocol[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSend(key)}
                      disabled={!input.trim() || loading || state.isAccusing}
                      className="group p-6 border border-zinc-800 bg-zinc-950/80 hover:border-red-600 transition-all flex flex-col items-start relative overflow-hidden active:scale-95 disabled:opacity-20"
                    >
                      <span className="text-xs font-black uppercase italic mb-2 group-hover:text-red-500 transition-colors text-zinc-500">{t.protocols[key].label}</span>
                      <span className="text-[10px] text-zinc-800 uppercase font-black tracking-widest leading-none group-hover:text-zinc-300">{t.protocols[key].desc}</span>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-red-600 group-hover:w-full transition-all duration-300" />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {state.phase === 'ENDGAME' && state.result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-50 bg-terminal-bg animate-in overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex flex-wrap gap-12 justify-center items-center pointer-events-none scale-150 grayscale rotate-12">
               {Array.from({length: 20}).map((_, i) => <ShieldAlert key={i} size={120} />)}
            </div>
            
            <h2 className={`text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter mb-12 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)] ${
              state.result === 'WIN' ? 'text-green-500' : state.result === 'CHAOS' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {state.result === 'WIN' ? t.resultWin : state.result === 'CHAOS' ? t.resultChaos : t.resultLose}
            </h2>

            <div className="bg-zinc-950/90 border-t-8 border-red-600 p-16 text-left max-w-5xl w-full mb-16 shadow-[0_40px_100px_rgba(0,0,0,0.9)] z-10 relative">
               <p className="text-3xl md:text-5xl font-black italic mb-16 text-zinc-100 leading-tight tracking-tight uppercase">
                 {state.result === 'WIN' ? t.winMsg : state.result === 'CHAOS' ? t.chaosMsg : t.loseMsg}
               </p>
               <div className="grid grid-cols-2 gap-20 text-[12px] font-black text-zinc-600 uppercase tracking-[0.5em]">
                  <div>SUBJECT_INTEGRITY<div className="text-8xl text-white tracking-tighter font-black mt-2">{state.suspicion}%</div></div>
                  <div>NEURAL_TENSION<div className="text-8xl text-white tracking-tighter font-black mt-2">{state.tension}%</div></div>
               </div>
            </div>

            <button 
              onClick={resetGame}
              className="px-20 py-10 bg-white text-black font-black text-3xl uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-10 border-4 border-zinc-200 active:scale-95 z-10"
            >
              <RefreshCw size={36} /> {t.btnReset}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
