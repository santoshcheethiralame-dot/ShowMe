"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EXAMPLES = [
  "why do seasons happen? isn't it distance from the sun?",
  "how does a black hole bend light?",
  "what actually happens in a recession?",
  "how does a neural network learn?",
];

const SKETCHING = [
  "finding the physics…",
  "sharpening the chalk…",
  "drawing the diagram…",
  "labelling the parts…",
  "adding the motion…",
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
    async (question: string) => {
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
          body: JSON.stringify({ question, priorQuestion: prior }),
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
    [phase, prior],
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      {/* Header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Show<span className="text-yellow">Me</span>
          </h1>
          <p className="mt-1 text-dim">
            Stop reading explanations.{" "}
            <span className="text-chalk">Watch one drawn for your question.</span>
          </p>
        </div>
        <Star className="hidden h-9 w-9 text-yellow sm:block" />
      </header>

      {/* Ask row */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="ask" className="sr-only">
          Ask a question to visualize
        </label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder={html ? "Ask a follow-up…" : "Ask anything — “why is the sky blue?”"}
          disabled={phase === "drawing"}
          className="flex-1 rounded-xl border-2 border-line bg-board px-4 py-3 text-chalk outline-none transition placeholder:text-dim/70 focus:border-yellow disabled:opacity-60"
        />
        <button
          onClick={() => ask(q)}
          disabled={phase === "drawing" || !q.trim()}
          className="wiggle rounded-xl bg-yellow px-6 py-3 font-display font-bold text-slate transition active:scale-95 disabled:cursor-not-allowed disabled:bg-line disabled:text-dim"
        >
          {phase === "drawing" ? "Drawing…" : "Show me"}
        </button>
      </div>

      {phase === "idle" && !html && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => ask(e)}
              className="wiggle rounded-full border-2 border-line px-3 py-1.5 text-sm text-dim transition hover:border-sky hover:text-chalk"
            >
              {e.length > 40 ? e.slice(0, 38) + "…" : e}
            </button>
          ))}
        </div>
      )}

      {err && (
        <p role="alert" className="mt-4 text-sm font-semibold text-coral">
          {err}
        </p>
      )}

      {/* Live status for screen readers */}
      <p aria-live="polite" className="sr-only">
        {phase === "drawing" ? "Drawing your answer, please wait." : phase === "done" ? "Your animation is ready." : ""}
      </p>

      <div className="mt-6 flex-1">
        {/* DRAWING — guess-first + a playful sketch indicator */}
        {phase === "drawing" && (
          <div className="pop grid items-start gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-line bg-board p-4">
              <div className="mb-2 flex items-center gap-2">
                <Star className="bob h-5 w-5 text-yellow" />
                <span className="font-display font-semibold">While I draw this…</span>
              </div>
              <p className="text-sm text-dim">
                What do <em className="not-italic font-semibold text-chalk">you</em> think? Guessing
                first makes it stick.
              </p>
              <label htmlFor="guess" className="sr-only">
                Your guess
              </label>
              <textarea
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your hunch…"
                className="mt-2 h-16 w-full resize-none rounded-xl border-2 border-line bg-slate px-3 py-2 text-chalk outline-none placeholder:text-dim/60 focus:border-mint"
              />
            </div>

            <div
              className="flex items-center gap-4 rounded-2xl border-2 border-line bg-board p-4"
              aria-hidden="true"
            >
              <Scribble className="h-12 w-12 shrink-0 text-mint" />
              <div className="min-w-0">
                <div className="font-display font-semibold text-chalk">
                  {SKETCHING[tick % SKETCHING.length]}
                </div>
                <div className="mt-1 font-mono text-xs text-dim tabular-nums">
                  {code.length.toLocaleString()} chalk strokes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DONE — the animation */}
        {phase === "done" && html && (
          <figure className="pop m-0">
            <div className="overflow-hidden rounded-2xl border-2 border-line bg-slate shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]">
              {!readMode ? (
                <iframe
                  key={asked}
                  srcDoc={html}
                  sandbox="allow-scripts"
                  title={`Animated answer to: ${asked}`}
                  className="h-[520px] w-full"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center p-8">
                  <p className="max-w-lg text-center text-lg leading-relaxed text-chalk">
                    {explain || "No text explanation was provided for this one."}
                  </p>
                </div>
              )}

              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-line px-4 py-2.5 text-xs">
                <span className="text-dim">
                  {live === false ? "pre-built example" : "drawn live by GPT-5.6"} · answering{" "}
                  <span className="text-chalk">“{asked}”</span>
                </span>
                {explain && (
                  <button
                    onClick={() => setReadMode((r) => !r)}
                    className="rounded-full border-2 border-line px-3 py-1 font-semibold text-sky transition hover:border-sky"
                    aria-pressed={readMode}
                  >
                    {readMode ? "Watch it" : "Read it instead"}
                  </button>
                )}
              </figcaption>
            </div>

            {/* Always-present accessible text, even while watching */}
            {explain && <p className="sr-only">{explain}</p>}

            {guess.trim() && (
              <p className="mt-3 text-sm text-dim">
                Your guess: <span className="text-chalk">“{guess.trim()}”</span> — how close were you?
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
        strokeWidth="3"
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
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
