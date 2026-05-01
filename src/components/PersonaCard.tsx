import { motion } from "motion/react";
import { PersonaResponse } from "../services/gemini";

interface PersonaCardProps {
  data: PersonaResponse;
  index: number;
}

export default function PersonaCard({ data, index }: PersonaCardProps) {
  const getScoreColor = (score: number) => {
    if (score <= 4) return "bg-red-600";
    if (score <= 7) return "bg-accent";
    return "bg-green-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score <= 4) return "text-red-600";
    if (score <= 7) return "text-accent";
    return "text-green-500";
  };

  const isDark = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex flex-col h-full border-r border-border ${isDark ? 'bg-bg-dark' : 'bg-bg-panel'}`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={data.persona}>
            {data.emoji}
          </span>
          <h3 className="font-black text-xs uppercase tracking-tighter text-white">
            {data.persona}
          </h3>
        </div>
        {data.score <= 3 && (
          <div className="px-2 py-0.5 bg-red-600 text-[8px] font-black uppercase tracking-tighter animate-pulse rounded-sm">
            {data.persona.includes('Meme') ? 'FAAAATH!!' : 'HELL NA'}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="h-1 w-full bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score * 10}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
              className={`h-full ${getScoreColor(data.score)}`}
            />
          </div>
          <div className="flex justify-between items-center">
             <span className={`text-[10px] font-mono font-bold uppercase ${getScoreTextColor(data.score)}`}>
              Score: {data.score}/10
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
              {data.verdict}
            </span>
          </div>
          <p className="text-sm italic leading-snug text-zinc-300 font-medium">
            "{data.roast}"
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-red-500 font-black block mb-1">Fatal Flaw</span>
              <p className="text-xs text-zinc-400 leading-tight border-l border-red-500/30 pl-2">
                {data.fatal_flaw}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-green-500 font-black block mb-1">Would flip if...</span>
              <p className="text-xs text-zinc-400 leading-tight border-l border-green-500/30 pl-2">
                {data.would_change_mind_if}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
