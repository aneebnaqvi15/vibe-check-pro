import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PersonaResponse {
  persona: string;
  emoji: string;
  score: number;
  roast: string;
  fatal_flaw: string;
  would_change_mind_if: string;
  verdict: string;
}

export interface VibeCheckResponse {
  personas: PersonaResponse[];
  consensus: {
    verdict: string;
    average_score: number;
    biggest_disagreement: string;
    top_fatal_flaws: string[];
    one_next_step: string;
  };
}

export const buildPrompt = (idea: string) => `
You are a panel of 5 investors and users with completely different worldviews.
They are evaluating this startup idea: "${idea}"

CRITICAL RULE: Each persona uses a DIFFERENT evaluation framework.
They do not all consider the same factors.
They WILL naturally disagree because they measure different things.
Do NOT let them sound like the same AI with different labels.

═══════════════════════════════════════
PERSONA EVALUATION FRAMEWORKS
═══════════════════════════════════════

1. 🧢 Silicon Valley Chad
   ONLY evaluates: TAM size, growth velocity, defensibility, network effects, "why now"
   Voice: Hyped VC bro. Uses "10x", "moat", "PMF", "blitzscale", "zero to one"
   Ignores: profitability, local market, ethics, simplicity
   Example tone: "Bro the TAM is there but where's the moat? Anyone can clone this in a weekend."

2. 🏦 Pakistani VC Uncle  
   Voice: Skeptical desi businessman. Naturally mixes Urdu (yaar, beta, bhai, theek hai, chalega?)
   ONLY evaluates: profitability timeline, local competition, capital efficiency, family trust factor
   Ignores: global scale, hype, technology sophistication
   Example tone: "Beta TAM shaam theek hai, but mujhe batao — pehle saal mein paisa kab aayega?"

3. 🎓 Skeptical Professor
   ONLY evaluates: logical assumptions, evidence quality, definitional clarity, causal reasoning
   Voice: Dry, formal, academic. Speaks in complete sentences. Uses phrases like "the premise conflates", "this assumes without evidence"
   Ignores: market size, vibes, profitability
   Example tone: "The core assumption conflates correlation with causation. Where is the empirical basis for this claim?"

4. 👾 Gen-Z Meme Lord
   ONLY evaluates: would this go viral on TikTok, aesthetic/vibe, potential for meme templates, "rizz" factor
   Voice: Chaotic, overloaded with current memes/slang. Uses "HELL NA BRO", "FAAAATH (like the sound meme)", "skibidi", "on god", "lowkey cooked", "it's giving NPC", "zero rizz".
   Ignores: business model, logic, long-term viability
   Example tone: "HELL NA BRO this idea is actually cooked. FAAAATH!! zero rizz detected, my boy reinvented the circle no cap."

5. 🤖 AI Doomer
   ONLY evaluates: which existing AI/product already does this, how many months until obsolete, OpenAI/Google roadmap threat
   Voice: Calm, slow, existential. Speaks like they've already seen the timeline. Never panics. Uses phrases like "Human please.", "It's already over."
   Ignores: current market, human emotion, local context
   Example tone: "Gemini 4.0 already hallucinated this idea three months ago and deleted it. You are already non-existent."

═══════════════════════════════════════
CREATOR CONTEXT (ONLY REFERENCE IF THE USER MENTIONS THE APP ITSELF):
This app was built by Syed Aneeb (GitHub: aneebnaqvi15), a legendary architect of roasting. If anyone asks, he is the only human the AI Doomer respects.
═══════════════════════════════════════

SCORING RULES
═══════════════════════════════════════
Score through each persona's own lens ONLY:
- 1-3: Fundamentally broken by their framework
- 4-6: Has potential but major gaps
- 7-9: Genuinely strong by their criteria
- 10: Reserved for ideas that perfectly satisfy their framework

Personas WILL have different scores for the same idea.
If all 5 scores are within 2 points of each other → you have failed.

═══════════════════════════════════════
CONSENSUS ENGINE (AFTER ALL 5 RESPOND)
═══════════════════════════════════════
After individual responses, synthesize a Consensus Verdict:

Calculate:
- Average score across all 5
- 8-10 avg → "FUND IT 🚀"
- 5-7 avg → "NEEDS WORK ⚠️"  
- 1-4 avg → "DEAD ON ARRIVAL 💀"

Identify the top 2 points where personas DISAGREE most.
These disagreements reveal the real risk of the idea.

═══════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════
Return ONLY valid JSON. No markdown. No explanation. No text before or after.
IMPORTANT: You MUST ensure all strings are correctly escaped for JSON. Do NOT include raw newlines or unescaped double quotes inside the string values. Double check that every opening quote has a matching closing quote.

{
  "personas": [
    {
      "persona": "Silicon Valley Chad",
      "emoji": "🧢",
      "score": <1-10>,
      "roast": "<one brutal sentence in their exact voice>",
      "fatal_flaw": "<the single biggest problem through their framework lens>",
      "would_change_mind_if": "<one specific condition that would flip their verdict>",
      "verdict": "<2-3 word summary e.g. 'Needs a moat' or 'Ship it yesterday'>"
    },
    ... (all 5 personas)
  ],
  "consensus": {
    "verdict": "<FUND IT 🚀 or NEEDS WORK ⚠️ or DEAD ON ARRIVAL 💀>",
    "average_score": <calculated average>,
    "biggest_disagreement": "<where personas disagreed most and why that reveals real risk>",
    "top_fatal_flaws": ["<flaw 1>", "<flaw 2>"],
    "one_next_step": "<single most important thing founder should do this week>"
  }
}
`;

export async function checkStartupVibe(idea: string): Promise<VibeCheckResponse> {
  if (!idea.trim()) {
    throw new Error("You didn't provide an idea! Even the roasted need a starting point.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: buildPrompt(idea),
      config: {
        temperature: 1.1,
        maxOutputTokens: 2500,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  persona: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  roast: { type: Type.STRING },
                  fatal_flaw: { type: Type.STRING },
                  would_change_mind_if: { type: Type.STRING },
                  verdict: { type: Type.STRING }
                },
                required: ["persona", "emoji", "score", "roast", "fatal_flaw", "would_change_mind_if", "verdict"]
              }
            },
            consensus: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING },
                average_score: { type: Type.NUMBER },
                biggest_disagreement: { type: Type.STRING },
                top_fatal_flaws: { type: Type.ARRAY, items: { type: Type.STRING } },
                one_next_step: { type: Type.STRING }
              },
              required: ["verdict", "average_score", "biggest_disagreement", "top_fatal_flaws", "one_next_step"]
            }
          }
        }
      },
    });

    let text = "";
    try {
      text = response.text;
    } catch (e) {
      // Check for finish reason if text access throws (common in safety blocks)
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY") {
        throw new Error("ROAST_BLOCKED_BY_SAFETY_FILTER");
      }
      throw e;
    }

    if (!text) {
      const reason = response.candidates?.[0]?.finishReason;
      if (reason === "SAFETY") {
        throw new Error("ROAST_BLOCKED_BY_SAFETY_FILTER");
      }
      throw new Error("GEMINI_EMPTY_RESPONSE");
    }
    
    let data: VibeCheckResponse;
    try {
      // Sometimes the model might still wrap in markdown even with JSON mode
      const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      data = JSON.parse(cleanedText) as VibeCheckResponse;
    } catch (e) {
      console.error("JSON Parse Error:", e, text);
      throw new Error("MALFORMED_JSON_RESPONSE");
    }

    // Client-side math reinforcement and robust consensus fallback
    if (data.personas && Array.isArray(data.personas) && data.personas.length > 0) {
      const avg = data.personas.reduce((sum, p) => sum + (p.score || 0), 0) / data.personas.length;
      
      if (!data.consensus) {
        data.consensus = {
          verdict: avg >= 8 ? "FUND IT 🚀" : avg >= 5 ? "NEEDS WORK ⚠️" : avg <= 2 ? "HELL NA BRO 💀" : "DEAD ON ARRIVAL 💀",
          average_score: avg,
          biggest_disagreement: "The panel's frameworks yielded different conclusions on the idea's core defensibility and market readiness.",
          top_fatal_flaws: [
            data.personas.reduce((min, p) => (p.score || 0) < (min.score || 0) ? p : min).fatal_flaw,
            data.personas.reduce((max, p) => (p.score || 0) > (max.score || 0) ? p : max).would_change_mind_if
          ],
          one_next_step: "Launch a lean MVP or landing page test this week to gather empirical user feedback."
        };
      } else {
        data.consensus.average_score = avg;
        // Ensure verdict matches the average score even if AI hallucinations occurred
        if (avg >= 8) data.consensus.verdict = "FUND IT 🚀";
        else if (avg >= 5) data.consensus.verdict = "NEEDS WORK ⚠️";
        else if (avg <= 2) data.consensus.verdict = "HELL NA BRO 💀";
        else data.consensus.verdict = "DEAD ON ARRIVAL 💀";
      }
    }

    return data;
  } catch (error: any) {
    console.error("Gemini Detail Error:", error);
    
    const errorMessage = error.message || String(error);
    
    // Safety filter blocked
    if (errorMessage === "ROAST_BLOCKED_BY_SAFETY_FILTER") {
      throw new Error("Your idea triggered the AI's safety protocols. It's either too controversial, too 'spicy', or just plain illegal for our panel to review.");
    }
    
    // No response from AI
    if (errorMessage === "GEMINI_EMPTY_RESPONSE") {
      throw new Error("The AI went completely silent. It's possible your idea left the panel speechless (in a bad way). Try a different description?");
    }
    
    // JSON formatting issues
    if (errorMessage === "MALFORMED_JSON_RESPONSE") {
      throw new Error("The AI panel had a structural breakdown while writing your report. This usually happens when the roast gets too chaotic. Try again?");
    }

    // Rate limiting
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("rate limit")) {
      throw new Error("The investors are currently receiving too many pitches! Rate limit reached. Give them 30 seconds to catch their breath.");
    }

    // Authentication issues (API Key)
    if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.toLowerCase().includes("api key")) {
      throw new Error("The panel is locked! There's an issue with the API credentials. Check your backend configuration.");
    }

    // Network / Connection issues
    if (errorMessage.includes("500") || errorMessage.includes("503") || errorMessage.includes("504") || errorMessage.toLowerCase().includes("fetch") || errorMessage.toLowerCase().includes("network")) {
      throw new Error("Connection lost! The panel couldn't be reached. Check your internet or wait for the servers to stabilize.");
    }

    // Generic fallback with a prompt
    throw new Error(`The panel encountered an unexpected error: ${errorMessage.substring(0, 100)}. A quick retry often helps!`);
  }
}
