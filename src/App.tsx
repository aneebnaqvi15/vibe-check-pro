import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Share2, Sparkles, RefreshCcw, Flame, AlertCircle, TrendingUp, History, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { checkStartupVibe, VibeCheckResponse } from "./services/gemini";
import PersonaCard from "./components/PersonaCard";
import LoadingState from "./components/LoadingState";

const SOUNDS = {
  DING: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  WHOOSH: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  BONK: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3"
};

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

interface SavedAudit {
  id: string;
  idea: string;
  timestamp: number;
  result: VibeCheckResponse;
}

export default function App() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VibeCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedAudit[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    // Check for shared audit in URL
    const params = new URLSearchParams(window.location.search);
    const auditData = params.get("audit");
    if (auditData) {
      try {
        // Safe base64 decoding for UTF-8
        const decoded = decodeURIComponent(atob(auditData).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const data = JSON.parse(decoded);
        setResults(data.result);
        setIdea(data.idea);
        setIsViewOnly(true);
        // Clear param to avoid re-loading on refresh if they navigate away
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to decode shared audit", e);
      }
    }

    const saved = localStorage.getItem("vibe_check_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (ideaStr: string, data: VibeCheckResponse) => {
    const newAudit: SavedAudit = {
      id: Date.now().toString(),
      idea: ideaStr,
      timestamp: Date.now(),
      result: data,
    };
    const updatedHistory = [newAudit, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem("vibe_check_history", JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("vibe_check_history", JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const data = await checkStartupVibe(idea);
      setResults(data);
      saveToHistory(idea, data);
      playSound(SOUNDS.DING);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the audit.");
      playSound(SOUNDS.BONK);
    } finally {
      setLoading(false);
    }
  };

  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleShare = () => {
    if (!results || !results.consensus) return;
    
    // Generate Share URL - Compact JSON and Safe Base64
    const payload = JSON.stringify({ idea, result: results });
    const encoded = btoa(encodeURIComponent(payload).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    
    const url = `${window.location.origin}${window.location.pathname}?audit=${encoded}`;
    setShareLink(url);

    const text = `I just got my startup idea roasted by 5 AI investors 💀
Overall Vibe Score: ${results.consensus.average_score.toFixed(1)}/10
Verdict: ${results.consensus.verdict}

Read the full audit here:
${url}

#VibeCheck #BuildWithGemini`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overallScore = results?.consensus?.average_score 
    ? results.consensus.average_score.toFixed(1) 
    : "0.0";

  return (
    <div className="min-h-screen font-sans border-0 lg:border-8 border-[#1a1a1a] flex flex-col bg-bg-dark text-white selection:bg-accent/30">
      <header className="h-16 lg:h-20 border-b border-border bg-bg-panel px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-accent flex items-center justify-center">
            <Flame className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-black uppercase tracking-tighter leading-none">VibeCheck</h1>
            <span className="text-[8px] lg:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">The Startup Audit Bureau</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {!isViewOnly && (
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                playSound(SOUNDS.WHOOSH);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest border border-border"
            >
              <History className="w-4 h-4" />
              {showHistory ? "Close Vault" : "The Vault"}
            </button>
          )}

          {isViewOnly && (
            <button
              onClick={() => {
                setIsViewOnly(false);
                setResults(null);
                setIdea("");
              }}
              className="px-6 py-2 bg-accent text-white font-black uppercase text-[10px] tracking-widest hover:bg-accent/80 transition-colors shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
            >
              Get Your Idea Roasted
            </button>
          )}

          {results && (
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Overall Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-accent">{overallScore} / 10</span>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative flex-1 flex flex-col overflow-hidden">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="absolute left-0 top-0 bottom-0 w-full md:w-80 bg-bg-panel border-r border-border z-40 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tighter">Roast Archive</h3>
                <button 
                  onClick={() => {
                    setShowHistory(false);
                    playSound(SOUNDS.WHOOSH);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Clock className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No past roasts stored in high-security memory.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      onClick={() => {
                        setResults(item.result);
                        setIdea(item.idea);
                        setShowHistory(false);
                      }}
                      className="group p-4 bg-bg-dark border border-zinc-800 hover:border-accent cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-mono text-accent uppercase font-bold">
                          Score: {item.result.consensus.average_score.toFixed(1)}
                        </span>
                        <button 
                          onClick={(e) => deleteFromHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-2 font-medium mb-2">"{item.idea}"</p>
                      <span className="text-[8px] text-zinc-600 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()} // {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-auto">
          {isViewOnly && results && (
            <div className="bg-bg-dark border-b border-border py-4 px-6 flex flex-col md:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full">
                <Shield className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Shared Official Audit</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest whitespace-nowrap">Report #V-{Date.now().toString().slice(-6)}</span>
                <span className="hidden md:inline text-[10px] text-zinc-800 font-bold uppercase tracking-widest">Digital Signature Verified</span>
              </div>
            </div>
          )}

          {!results && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
            <header className="text-center mb-16 space-y-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-accent inline-block px-3 py-1 font-black text-xs uppercase tracking-widest"
              >
                System Online // Audit Ready
              </motion.div>
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Will your startup <br />
                <span className="text-accent underline decoration-4 underline-offset-8">survive the roast?</span>
              </h2>
              <p className="text-zinc-500 font-medium text-lg lg:text-xl">
                Paste your idea below for a technical and market audit by our AI panel.
              </p>
            </header>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-4 border-border focus-within:border-accent transition-colors bg-bg-panel p-1">
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your startup in 2-3 sentences..."
                    className="w-full h-48 bg-bg-dark border-0 p-6 text-xl text-white placeholder:text-zinc-700 font-medium focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!idea.trim() || loading}
                  className="w-full h-16 bg-white text-black font-black text-xl hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                >
                  <Flame className="w-6 h-6" />
                  Initialize Roast Sequence
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {loading && <LoadingState />}

        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-xl w-full text-center p-8 border-4 border-red-600 bg-red-600/5">
              <p className="text-red-500 font-mono uppercase text-sm mb-6 font-bold tracking-widest">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="px-6 py-3 border-2 border-red-500 text-red-500 font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full relative overflow-hidden"
            >
              {/* Background Watermark for Shared View */}
              {isViewOnly && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
                  <span className="text-[20vw] font-black uppercase tracking-widest rotate-[-15deg] whitespace-nowrap">
                    CONFIDENTIAL
                  </span>
                </div>
              )}

              <section className="p-6 lg:p-10 bg-gradient-to-b from-bg-panel to-bg-dark border-b border-border">
                <div className="max-w-5xl mx-auto">
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold mb-4 block">
                    Startup Idea Context
                  </span>
                  <div className="text-xl lg:text-3xl font-bold leading-tight border-l-8 border-accent pl-8 italic text-zinc-300">
                    "{idea}"
                  </div>
                </div>
              </section>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 border-b border-border">
                {results.personas.map((persona, i) => (
                  <PersonaCard key={persona.persona} data={persona} index={i} />
                ))}
              </div>

              {results.consensus && (
                <>
                  <section className="bg-bg-panel grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
                    <div className="p-8 space-y-4">
                      <div className="flex items-center gap-2 text-accent">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Major Disagreement</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                        {results.consensus.biggest_disagreement}
                      </p>
                    </div>
                    
                    <div className="p-8 space-y-4">
                       <div className="flex items-center gap-2 text-red-500">
                        <Flame className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Top Fatal Flaws</span>
                      </div>
                      <ul className="space-y-2">
                        {results.consensus.top_fatal_flaws.map((flaw, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            {flaw}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-8 space-y-4">
                      <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Immediate Next Step</span>
                      </div>
                      <p className="text-sm text-zinc-300 font-bold">
                        {results.consensus.one_next_step}
                      </p>
                    </div>
                  </section>

                  <div className="p-8 lg:p-12 bg-bg-dark text-center border-t border-border flex flex-col items-center justify-center gap-6">
                    <AnimatePresence>
                      {shareLink && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full max-w-2xl bg-accent/5 border border-accent/20 p-6 space-y-4 overflow-hidden"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-accent">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-[10px] uppercase font-black tracking-widest">Shareable Audit Vault URL</span>
                            </div>
                            <button 
                              onClick={() => setShareLink(null)}
                              className="text-zinc-600 hover:text-white transition-colors"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              readOnly 
                              value={shareLink}
                              className="flex-1 bg-black/40 border border-border px-4 py-3 text-[10px] font-mono text-zinc-400 focus:outline-none focus:border-accent transition-colors"
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(shareLink);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="px-6 py-3 bg-accent text-white font-black uppercase text-[10px] tracking-widest hover:bg-accent/80 transition-colors"
                            >
                              Copy Link
                            </button>
                          </div>
                          <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                            Anyone with this link can view this specific audit. No login required.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Final Consensus Verdict</span>
                      <div className="text-4xl lg:text-7xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
                        {results.consensus.verdict}
                      </div>
                      <div className="text-2xl font-mono text-zinc-500">
                        Avg Score: <span className="text-white">{overallScore}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={handleShare}
                        className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 min-w-[240px] justify-center"
                      >
                        {copied ? (
                          <span className="flex items-center gap-2 text-green-600">
                            <Sparkles className="w-5 h-5" />
                            Copied to Clipboard
                          </span>
                        ) : (
                          <>
                            <Share2 className="w-5 h-5" />
                            Download Report
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setResults(null);
                          setIdea("");
                        }}
                        className="px-10 py-5 border-4 border-white text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all"
                      >
                        Wipe System
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      <footer className="h-12 border-t border-border bg-black flex items-center justify-between px-6 sticky bottom-0 z-50">
        <div className="flex gap-6 text-[10px] font-mono text-zinc-500 uppercase font-medium items-center">
          <span className="hidden sm:inline">Engine: v2.0-Flash</span>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span>Built by <a href="https://github.com/aneebnaqvi15" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent underline transition-colors">Syed Aneeb (@aneebnaqvi15)</a></span>
        </div>
        <div className="flex items-center gap-3">
          <motion.span 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          ></motion.span>
          <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-400">Panel Online: 5/5 Personas Ready</span>
        </div>
      </footer>
    </div>
  );
}
