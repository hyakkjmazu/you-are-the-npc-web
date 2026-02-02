
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS, NPC_ROLES } from './constants';
import { GameState, Message, DialogueProtocol } from './types';
import { generateNPCResponse } from './services/geminiService';
import { ambient } from './services/audioService';
import { Terminal, ShieldAlert, Send, RefreshCw, Zap } from 'lucide-react';

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
      messages: [{ role: 'system', text: `INITIALIZING SUBJECT: ${id.toUpperCase()}` }]
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
      
      let sImpact = 0, tImpact = 5;
      switch(protocol) {
        case 'TRUTH': sImpact = -5; break;
        case 'HALF_TRUTH': sImpact = 5; tImpact = 10; break;
        case 'LIE': sImpact = 20; tImpact = 15; break;
        case 'EMOTIONAL': sImpact = 10; tImpact = -5; break;
        case 'REDIRECT': sImpact = 5; tImpact = 5; break;
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
      if (state.suspicion > 70) result = 'WIN';
      else if (state.suspicion > 40) result = 'CHAOS';
      else result = 'LOSE';
      setState(prev => ({ ...prev, phase: 'ENDGAME', result, isAccusing: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-[#f0f0f0] font-mono overflow-hidden select-none">
      <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent h-40 w-full animate-scan opacity-30" />

      {/* Header */}
      <header className="flex-none h-14 border-b border-zinc-900 flex justify-between items-center px-6 bg-black/80 z-40">
        <div className="flex items-center gap-2">
          <Terminal className="text-red-600" size={14} />
          <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-500 uppercase">{t.subtitle}</span>
        </div>
        <button 
          onClick={() => setState(p => ({ ...p, lang: p.lang === 'VI' ? 'EN' : 'VI' }))}
          className="text-[9px] font-bold border border-zinc-800 px-3 py-1 hover:bg-white hover:text-black transition-all uppercase"
        >
          {state.lang}
        </button>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        {state.phase === 'LOBBY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-flicker">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-2 terminal-glow text-white text-center">
              {t.title}
            </h1>
            <p className="text-zinc-700 text-[9px] tracking-[0.8em] uppercase mb-12 font-bold">{t.auth}</p>
            <button 
              onClick={handleStart}
              className="px-12 py-5 bg-white text-black font-black text-lg uppercase hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
            >
              {t.btnStart}
            </button>
          </div>
        )}

        {state.phase === 'BRIEFING' && (
          <div className="flex-1 overflow-y-auto p-8 md:p-12 w-full max-w-4xl mx-auto custom-scrollbar animate-in">
            <h2 className="text-3xl font-black italic mb-10 border-l-4 border-red-600 pl-6 uppercase tracking-tight text-white">{t.briefingTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {NPC_ROLES.map((npc) => (
                <div 
                  key={npc.id}
                  onClick={() => selectNPC(npc.id)}
                  className="group p-8 border-2 border-zinc-900 bg-black/50 hover:border-red-600 cursor-pointer transition-all flex flex-col h-full active:scale-95"
                >
                  <h3 className="text-xl font-black mb-2 uppercase italic text-white group-hover:text-red-500">{npc.name[state.lang]}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mb-8 leading-relaxed uppercase">{npc.description[state.lang]}</p>
                  <div className="mt-auto text-[8px] font-black tracking-widest text-zinc-800 group-hover:text-white uppercase">CONNECTING...</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.phase === 'INTERACTION' && state.selectedNPCId && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 border-t border-zinc-900">
            {/* Minimal Sidebar */}
            <aside className="w-full lg:w-64 border-r border-zinc-900 p-6 flex flex-col gap-8 bg-black/90 shrink-0">
              <div className="space-y-2">
                <div className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">{t.monitoring}</div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {NPC_ROLES.find(n => n.id === state.selectedNPCId)?.name[state.lang]}
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-600 mb-2">
                    <span>{t.suspicion}</span>
                    <span className={state.suspicion > 70 ? 'text-red-500' : ''}>{state.suspicion}%</span>
                  </div>
                  <div className="h-1 bg-zinc-900"><div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${state.suspicion}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-600 mb-2">
                    <span>{t.tension}</span>
                    <span>{state.tension}%</span>
                  </div>
                  <div className="h-1 bg-zinc-900"><div className="h-full bg-white transition-all duration-500" style={{ width: `${state.tension}%` }} /></div>
                </div>
              </div>

              <button 
                onClick={handleAccuse}
                disabled={state.isAccusing || loading}
                className="mt-auto py-4 border border-red-600 text-white font-black text-[10px] uppercase hover:bg-red-600 transition-all disabled:opacity-20 active:scale-95"
              >
                {state.isAccusing ? t.accusing : t.accuse}
              </button>
            </aside>

            {/* Chat Area */}
            <section className="flex-1 flex flex-col min-h-0">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
                {state.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'system' ? 'justify-center' : m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                    {m.role === 'system' ? (
                      <span className="text-[8px] text-zinc-600 border border-zinc-900 px-4 py-1 uppercase">{m.text}</span>
                    ) : (
                      <div className={`max-w-[80%] relative border ${m.role === 'user' ? 'bg-white text-black border-zinc-200 p-4' : 'bg-zinc-900 border-zinc-800 p-6'}`}>
                        {m.role === 'model' && (
                          <div className="absolute -top-4 left-0 text-[8px] font-black text-red-500 bg-black px-2 py-0.5 border border-zinc-800 uppercase tracking-widest">
                             BIO::{ t.bio[m.bioStatus || 'STABLE'] }
                          </div>
                        )}
                        <div className={`leading-tight font-black tracking-tight ${m.role === 'user' ? 'text-sm' : 'text-2xl md:text-3xl npc-glow text-white uppercase'}`}>
                          {m.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && <div className="text-center text-[8px] text-zinc-800 font-bold animate-pulse tracking-[0.5em]">{t.analyzing}</div>}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-zinc-900 bg-black">
                <div className="flex gap-4 mb-6">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || state.isAccusing}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent border-b border-zinc-800 focus:border-red-600 outline-none pb-2 text-xl font-bold uppercase text-white"
                    onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleSend('TRUTH')}
                  />
                  <button onClick={() => handleSend('TRUTH')} disabled={!input.trim() || loading} className="p-2 bg-white text-black hover:bg-red-600 hover:text-white transition-all active:scale-90 disabled:opacity-10"><Send size={20} /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(Object.keys(t.protocols) as DialogueProtocol[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSend(key)}
                      disabled={!input.trim() || loading}
                      className="group p-3 border border-zinc-800 hover:border-red-600 transition-all text-left flex flex-col active:scale-95 disabled:opacity-20"
                    >
                      <span className="text-[9px] font-black uppercase text-zinc-500 group-hover:text-white">{t.protocols[key].label}</span>
                      <span className="text-[7px] text-zinc-700 uppercase group-hover:text-red-500">{t.protocols[key].desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {state.phase === 'ENDGAME' && state.result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-50 bg-[#050505] animate-in">
            <h2 className={`text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-6 ${
              state.result === 'WIN' ? 'text-green-500' : state.result === 'CHAOS' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {state.result === 'WIN' ? t.resultWin : state.result === 'CHAOS' ? t.resultChaos : t.resultLose}
            </h2>
            <div className="bg-zinc-950/80 border border-zinc-900 p-10 text-left max-w-2xl w-full mb-10">
               <p className="text-xl md:text-2xl font-black italic mb-8 text-zinc-300">
                 {state.result === 'WIN' ? t.winMsg : state.result === 'CHAOS' ? t.chaosMsg : t.loseMsg}
               </p>
               <div className="flex gap-10 text-[10px] font-bold text-zinc-700 uppercase">
                  <div>SUSPICION <span className="text-white text-3xl block">{state.suspicion}%</span></div>
                  <div>TENSION <span className="text-white text-3xl block">{state.tension}%</span></div>
               </div>
            </div>
            <button onClick={() => window.location.reload()} className="px-10 py-5 bg-white text-black font-black uppercase hover:bg-red-600 hover:text-white transition-all transform active:scale-95 border-2 border-zinc-300">
              {t.btnReset}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
