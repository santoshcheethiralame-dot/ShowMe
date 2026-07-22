"use client";

import { useCallback, useEffect, useState } from "react";
import { FIXTURES } from "@/lib/fixtures";

const EXAMPLES = [
  "why do seasons happen? isn't it distance from the sun?",
  "how does a black hole bend light?",
  "what actually happens in a recession?",
  "how does a neural network learn?",
];

const SURPRISES = [
  "how does an airplane wing create lift?",
  "why is the sky blue but sunsets red?",
  "how does a vaccine train your immune system?",
  "what is a Fourier transform, visually?",
  "how does compound interest snowball?",
  "why does ice float on water?",
  "how does GPS know where you are?",
  "what happens inside a black hole?",
  "how does a suspension bridge hold itself up?",
  "why do we have leap years?",
];

const SKETCHING = [
  "finding the physics…",
  "sharpening the chalk…",
  "drawing the diagram…",
  "labelling the parts…",
  "adding the motion…",
];

const FOLLOWUPS = [
  { label: "Simpler", make: (q: string) => `Explain that more simply, like I'm 12: ${q}` },
  { label: "Go deeper", make: (q: string) => `Go deeper and show more of the mechanism behind: ${q}` },
  { label: "Give an example", make: (q: string) => `Show a concrete real-world example of: ${q}` },
];

type Phase = "idle" | "drawing" | "done";

function extractExplain(raw: string): string {
  const m = raw.match(/<!--\s*EXPLAIN:\s*([\s\S]*?)-->/i);
  return m ? m[1].trim() : "";
}
function toDoc(raw: string): string {
  const m = raw.match(/<!doctype html[\s\S]*<\/html>/i);
  const doc = m ? m[0] : raw;
  return doc.replace(/<!--\s*EXPLAIN:[\s\S]*?-->/i, "");
}

export default function Home() {
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [code, setCode] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [explain, setExplain] = useState("");
  const [live, setLive] = useState<boolean | null>(null);
  const [prior, setPrior] = useState<string | undefined>();
  const [asked, setAsked] = useState("");
  const [guess, setGuess] = useState("");
  const [readMode, setReadMode] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase !== "drawing") return;
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, [phase]);

  const ask = useCallback(
    async (question: string, priorForThis?: string) => {
      if (!question.trim() || phase === "drawing") return;
      setErr(null);
      setPhase("drawing");
      setCode("");
      setHtml(null);
      setExplain("");
      setGuess("");
      setReadMode(false);
      setAsked(question);
      setQ("");

      try {
        const res = await fetch("/api/animate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, priorQuestion: priorForThis }),
        });
        if (!res.ok || !res.body) throw new Error("no stream");
        setLive(res.headers.get("x-showme-live") === "true");

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let raw = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += dec.decode(value, { stream: true });
          setCode(raw);
        }

        setExplain(extractExplain(raw));
        setHtml(toDoc(raw));
        setPrior(question);
        setPhase("done");
      } catch {
        setErr("Something broke mid-draw. Try again.");
        setPhase("idle");
      }
    },
    [phase],
  );

  const surprise = () => ask(SURPRISES[Math.floor(tick + Date.now()) % SURPRISES.length]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      {/* Header */}
      <header className="mb-8 flex items-end justify-between border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Show<span className="bg-violet px-1.5 text-paper">Me</span>
          </h1>
          <p className="mt-2 font-body text-ink/70">
            Stop reading explanations.{" "}
            <span className="font-bold text-ink">Watch one drawn for your question.</span>
          </p>
        </div>
        <Star className="bob hidden h-10 w-10 text-violet sm:block" />
      </header>

      {/* Ask row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="ask" className="sr-only">
          Ask a question to visualize
        </label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q, prior)}
          placeholder={html ? "Ask a follow-up…" : "Ask anything — “why is the sky blue?”"}
          disabled={phase === "drawing"}
          className="brut flex-1 rounded-lg border-[3px] border-ink bg-white px-4 py-3 text-ink outline-none placeholder:text-ink/40 disabled:opacity-60"
        />
        <button
          onClick={() => ask(q, prior)}
          disabled={phase === "drawing" || !q.trim()}
          className="brut-btn rounded-lg border-[3px] border-ink bg-violet px-6 py-3 font-display font-bold text-paper"
        >
          {phase === "drawing" ? "Drawing…" : "Show me"}
        </button>
      </div>

      {phase !== "drawing" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={surprise}
            className="brut-btn rounded-full border-[3px] border-ink bg-sun px-4 py-1.5 text-sm font-bold text-ink"
          >
            🎲 Surprise me
          </button>
          {!html &&
            EXAMPLES.map((e, i) => (
              <button
                key={e}
                onClick={() => ask(e)}
                className="brut-btn rounded-full border-[3px] border-ink px-3 py-1.5 text-sm font-semibold"
                style={{ background: ["#b8f13a", "#37c8ff", "#ff5a5f", "#ffc83a"][i % 4] }}
              >
                {e.length > 36 ? e.slice(0, 34) + "…" : e}
              </button>
            ))}
        </div>
      )}

      {err && (
        <p role="alert" className="mt-4 border-[3px] border-ink bg-coral px-3 py-2 font-bold text-paper">
          {err}
        </p>
      )}

      {/* Hero showcase — a real answer, already running */}
      {phase === "idle" && !html && (
        <figure className="pop m-0 mt-6">
          <div className="brut-lg overflow-hidden rounded-xl border-[3px] border-ink bg-slate">
            <iframe
              srcDoc={FIXTURES[0].html}
              sandbox="allow-scripts"
              title="Example animation: why do seasons happen"
              className="h-[420px] w-full"
            />
            <figcaption className="flex items-center gap-2 border-t-[3px] border-ink bg-sun px-4 py-2.5 text-sm font-bold text-ink">
              <span className="rotate-[-3deg] bg-ink px-2 py-0.5 text-paper">☝ a real answer</span>
              <span>Now ask your own up top — anything at all.</span>
            </figcaption>
          </div>
        </figure>
      )}

      <p aria-live="polite" className="sr-only">
        {phase === "drawing" ? "Drawing your answer, please wait." : phase === "done" ? "Your animation is ready." : ""}
      </p>

      <div className="mt-6 flex-1">
        {/* DRAWING — guess-first + playful sketch indicator */}
        {phase === "drawing" && (
          <div className="pop grid items-start gap-4 sm:grid-cols-2">
            <div className="brut rounded-xl border-[3px] border-ink bg-lime p-4">
              <div className="mb-2 flex items-center gap-2">
                <Star className="bob h-5 w-5 text-ink" />
                <span className="font-display font-bold">While I draw this…</span>
              </div>
              <p className="text-sm font-semibold text-ink/80">
                What do <span className="underline decoration-2">you</span> think? Guessing first
                makes it stick.
              </p>
              <label htmlFor="guess" className="sr-only">
                Your guess
              </label>
              <textarea
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your hunch…"
                className="mt-2 h-16 w-full resize-none rounded-lg border-[3px] border-ink bg-white px-3 py-2 text-ink outline-none placeholder:text-ink/40"
              />
            </div>

            <div
              className="brut flex items-center gap-4 rounded-xl border-[3px] border-ink bg-sky p-4"
              aria-hidden="true"
            >
              <Scribble className="h-12 w-12 shrink-0 text-ink" />
              <div className="min-w-0">
                <div className="font-display font-bold text-ink">
                  {SKETCHING[tick % SKETCHING.length]}
                </div>
                <div className="mt-1 font-mono text-xs font-bold text-ink/70 tabular-nums">
                  {code.length.toLocaleString()} chalk strokes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DONE — the animation */}
        {phase === "done" && html && (
          <figure className="pop m-0">
            <div className="brut-lg overflow-hidden rounded-xl border-[3px] border-ink bg-slate">
              {!readMode ? (
                <iframe
                  key={asked}
                  srcDoc={html}
                  sandbox="allow-scripts"
                  title={`Animated answer to: ${asked}`}
                  className="h-[500px] w-full"
                />
              ) : (
                <div className="flex h-[500px] items-center justify-center p-8">
                  <p className="max-w-lg text-center text-lg font-semibold leading-relaxed text-paper">
                    {explain || "No text explanation was provided for this one."}
                  </p>
                </div>
              )}

              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-ink bg-paper px-4 py-2.5 text-xs">
                <span className="font-semibold text-ink/70">
                  {live === false ? "pre-built example" : "drawn live by GPT-5.6"} · “
                  <span className="text-ink">{asked}</span>”
                </span>
                {explain && (
                  <button
                    onClick={() => setReadMode((r) => !r)}
                    className="brut-btn rounded-full border-[3px] border-ink bg-sky px-3 py-1 font-bold text-ink"
                    aria-pressed={readMode}
                  >
                    {readMode ? "▶ Watch it" : "📖 Read it instead"}
                  </button>
                )}
              </figcaption>
            </div>

            {explain && <p className="sr-only">{explain}</p>}

            {/* One-tap follow-ups */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-ink/60">Ask more:</span>
              {FOLLOWUPS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => ask(f.make(asked), asked)}
                  className="brut-btn rounded-full border-[3px] border-ink px-3 py-1.5 text-sm font-bold text-ink"
                  style={{ background: ["#b8f13a", "#ffc83a", "#37c8ff"][i % 3] }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {guess.trim() && (
              <p className="mt-3 text-sm font-semibold text-ink/70">
                Your guess: <span className="text-ink">“{guess.trim()}”</span> — how close were you?
              </p>
            )}
          </figure>
        )}
      </div>
    </main>
  );
}

function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 32 C 12 10, 20 44, 26 22 S 38 8, 44 30"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="scribble"
      />
    </svg>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l2.2 5.2 5.6.5-4.3 3.7 1.3 5.5L12 15.8 7.2 18.4l1.3-5.5L4.2 9.2l5.6-.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
