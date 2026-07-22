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

  const landing = phase === "idle" && !html;

  const askBar = (
    <div>
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
          className="brut flex-1 rounded-lg border-[3px] border-ink bg-white px-4 py-3.5 text-lg text-ink outline-none placeholder:text-ink/40 disabled:opacity-60"
        />
        <button
          onClick={() => ask(q, prior)}
          disabled={phase === "drawing" || !q.trim()}
          className="brut-btn rounded-lg border-[3px] border-ink bg-violet px-7 py-3.5 font-display text-lg font-bold text-paper"
        >
          {phase === "drawing" ? "Drawing…" : "Show me"}
        </button>
      </div>

      {phase !== "drawing" && (
        <div className="mt-4">
          {!html && (
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wide text-ink/50">
              or try one
            </p>
          )}
          <div className="flex flex-wrap items-stretch gap-3">
            <button
              onClick={surprise}
              className="brut-btn shrink-0 rounded-lg border-[3px] border-ink bg-lime px-4 py-2.5 text-sm font-bold text-ink"
            >
              Surprise me
            </button>
            {!html && (
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {EXAMPLES.map((e, i) => (
                  <button
                    key={e}
                    onClick={() => ask(e)}
                    className="brut-btn truncate rounded-lg border-[3px] border-ink px-4 py-2.5 text-left text-sm font-semibold text-ink"
                    style={{ background: ["#b8f13a", "#37c8ff", "#ff5a5f", "#ffc83a"][i % 4] }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      {/* Top bar */}
      <header className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Show<span className="bg-violet px-1.5 text-paper">Me</span>
        </h1>
        <span className="hidden border-[3px] border-ink bg-white px-3 py-1 font-mono text-xs font-bold sm:block">
          science, drawn on demand
        </span>
      </header>

      {err && (
        <p role="alert" className="mb-4 border-[3px] border-ink bg-coral px-3 py-2 font-bold text-paper">
          {err}
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {phase === "drawing" ? "Drawing your answer, please wait." : phase === "done" ? "Your animation is ready." : ""}
      </p>

      {/* LANDING — big composed hero */}
      {landing ? (
        <>
          <section className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="relative">
              <span className="mb-6 inline-block rotate-[-2deg] border-[3px] border-ink bg-sun px-4 py-1.5 font-mono text-sm font-bold">
                powered by GPT-5.6
              </span>
              <h2 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
                Ask anything.{" "}
                <span className="bg-coral px-2 text-paper [box-decoration-break:clone]">Watch</span>{" "}
                it drawn.
              </h2>
              <p className="mt-6 max-w-lg text-xl font-semibold text-ink/70">
                Not the same textbook diagram everyone gets — a custom animation, built live for
                <span className="text-ink"> your exact question.</span>
              </p>
              <div className="mt-7">{askBar}</div>
            </div>

            <figure className="pop relative m-0">
              <Star className="bob absolute -left-5 -top-5 z-10 h-12 w-12 text-violet" />
              <div className="brut-lg overflow-hidden rounded-xl border-[3px] border-ink bg-slate">
                <iframe
                  srcDoc={FIXTURES[0].html}
                  sandbox="allow-scripts"
                  title="Example animation: how a pendulum swings"
                  className="h-[500px] w-full"
                />
                <figcaption className="flex items-center gap-2 border-t-[3px] border-ink bg-sky px-4 py-2.5 text-sm font-bold text-ink">
                  <span className="rotate-[-3deg] bg-ink px-2 py-0.5 text-paper">a real one</span>
                  <span>Made by asking, not by hand.</span>
                </figcaption>
              </div>
            </figure>
          </section>

          {/* How it works */}
          <section className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Ask", d: "Type any question. Big or weird, doesn't matter.", c: "#b8f13a" },
              { n: "2", t: "Watch it draw", d: "GPT-5.6 builds a live animation, in front of you.", c: "#37c8ff" },
              { n: "3", t: "Actually get it", d: "See the mechanism move — then read it, or dig deeper.", c: "#ff5a5f" },
            ].map((s) => (
              <div key={s.n} className="brut rounded-xl border-[3px] border-ink bg-white p-5">
                <span
                  className="flex h-11 w-11 items-center justify-center border-[3px] border-ink font-display text-xl font-bold"
                  style={{ background: s.c }}
                >
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-1 text-sm font-semibold text-ink/70">{s.d}</p>
              </div>
            ))}
          </section>
        </>
      ) : (
        askBar
      )}

      <div className="mt-6 flex-1">
        {/* DRAWING — reserve the animation's full footprint so nothing jumps */}
        {phase === "drawing" && (
          <div className="pop">
            <div
              className="brut-lg flex h-[520px] flex-col items-center justify-center gap-6 rounded-xl border-[3px] border-ink bg-slate"
              aria-hidden="true"
            >
              <Scribble className="h-24 w-24 text-lime" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-paper">
                  {SKETCHING[tick % SKETCHING.length]}
                </div>
                <div className="mt-2 font-mono text-sm font-bold text-sky tabular-nums">
                  {code.length.toLocaleString()} chalk strokes and counting
                </div>
              </div>
              <div className="h-1.5 w-56 overflow-hidden rounded-full border-2 border-line bg-slate">
                <div className="h-full w-1/3 animate-[slide_1.1s_ease-in-out_infinite] bg-lime" />
              </div>
            </div>

            <div className="brut mt-4 flex flex-col gap-3 rounded-xl border-[3px] border-ink bg-lime p-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="shrink-0">
                <div className="font-display text-lg font-bold">While I draw — what do you think?</div>
                <div className="text-sm font-semibold text-ink/70">
                  Guessing first makes the answer stick.
                </div>
              </div>
              <label htmlFor="guess" className="sr-only">
                Your guess
              </label>
              <textarea
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your hunch…"
                className="h-14 flex-1 resize-none rounded-lg border-[3px] border-ink bg-white px-3 py-2 text-ink outline-none placeholder:text-ink/40"
              />
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
                  className="h-[520px] w-full"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center p-8">
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
                    {readMode ? "Watch it" : "Read it instead"}
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
