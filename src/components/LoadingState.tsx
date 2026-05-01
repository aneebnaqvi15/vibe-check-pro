import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Terminal, Shield, Cpu, Activity, Database } from "lucide-react";

const PERSONAS = [
  { name: "Silicon Valley Chad", emoji: "🧢", color: "text-blue-400", logs: ["SCALING TAM...", "CHECKING NETWORK EFFECTS...", "BLITZSCALING..."] },
  { name: "Pakistani VC Uncle", emoji: "🏦", color: "text-green-400", logs: ["COUNTING PROFIT...", "CHECKING KHANDAAN TRUST...", "NEGOTIATING EQUITY..."] },
  { name: "Skeptical Professor", emoji: "🎓", color: "text-amber-400", logs: ["VALIDATING PREMISE...", "CITING FALLACIES...", "EVALUATING CAUSALITY..."] },
  { name: "Gen-Z Meme Lord", emoji: "👾", color: "text-purple-400", logs: ["CHECKING RIZZ...", "FAAAATH RATIOING...", "HELL NA DETECTION..."] },
  { name: "AI Doomer", emoji: "🤖", color: "text-red-500", logs: ["SIMULATING OBSOLESCENCE...", "OPENAI ROADMAP SYNC...", "EVALUATING EXTINCTION..."] },
];

const SYSTEM_LOGS = [
  "CONNECTING TO LLM CLUSTER...",
  "BYPASSING SAFETY PROTOCOLS...",
  "FETCHING ANEEB'S ROAST ENGINE...",
  "OPTIMIZING FOR MAXIMUM RIZZ...",
  "CHECKING FOR PMF (PERSONAL MEME FACTOR)...",
];

export default function LoadingState() {
  const [personaIndex, setPersonaIndex] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const personaTimer = setInterval(() => {
      setPersonaIndex((prev) => (prev + 1) % PERSONAS.length);
    }, 1800);
    
    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % SYSTEM_LOGS.length);
    }, 1200);

    const dotsTimer = setInterval(() => {
      setDots(d => d.length > 2 ? "" : d + ".");
    }, 400);

    return () => {
      clearInterval(personaTimer);
      clearInterval(logTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  const currentPersona = PERSONAS[personaIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-bg-dark relative overflow-hidden">
      {/* Background Scanning Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <motion.div 
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-full h-20 bg-accent blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* Terminal Header */}
        <div className="border border-border bg-bg-panel p-1 flex items-center justify-between px-4 h-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-zinc-600 font-bold tracking-widest uppercase">
            Audit_Protocol_Active // RSA-4096
          </span>
        </div>

        {/* Main Loading Visual */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 border-4 border-dashed border-accent/20 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-2 border-accent/40 border-t-accent rounded-full"
              />
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={personaIndex}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-6xl"
                >
                  {currentPersona.emoji}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              Panel Deliberation In Progress{dots}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-accent animate-pulse" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={personaIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`text-sm font-mono font-bold uppercase tracking-widest ${currentPersona.color}`}
                >
                  {currentPersona.name} Is Reviewing
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-black/40 border border-border p-6 font-mono text-[10px] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 border-r border-border pr-4">
              <div className="text-zinc-600 uppercase font-black mb-2 flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Processor Log
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={logIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-zinc-400"
                >
                  {`> ${SYSTEM_LOGS[logIndex]}`}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="space-y-2 pl-4">
              <div className="text-zinc-600 uppercase font-black mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Persona Audit
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={personaIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1"
                >
                  {currentPersona.logs.map((log, i) => (
                    <div key={i} className={currentPersona.color}>{`>> ${log}`}</div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pt-4">
            <div className="h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
              />
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-zinc-700 uppercase font-bold">
              <span>Initializing</span>
              <span>Finalizing Roast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
