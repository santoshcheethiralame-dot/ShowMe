"use client";

import { useState } from "react";

const EXAMPLES = [
  "why do seasons happen? isn't it distance from the sun?",
  "how does a black hole bend light?",
  "what actually happens during a recession?",
  "how does a neural network learn?",
];

export default function Home() {
  const [q, setQ] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [prior, setPrior] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, priorQuestion: html ? prior : undefined }),
      }).then((res) => res.json());
      if (r.html) {
        setHtml(r.html);
        setLive(r.live ?? null);
        setPrior(question);
        setQ("");
      } else {
        setErr("Could not build that one. Try rephrasing.");
      }
    } catch {
      setErr("Something broke. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Show<span className="text-amber">Me</span>
        </h1>
        <p className="mt-1 text-dim">
          Stop reading explanations.{" "}
          <span className="text-ink">Watch one built for your question.</span>
        </p>
      </header>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder={html ? "Ask a follow-up…" : "Ask anything — “why is the sky blue?”"}
          disabled={busy}
          className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-ink outline-none placeholder:text-dim/70 focus:border-dim"
        />
        <button
          onClick={() => ask(q)}
          disabled={busy || !q.trim()}
          className="rounded-lg bg-amber px-5 py-3 font-semibold text-void transition hover:brightness-110 disabled:bg-line disabled:text-dim"
        >
          {busy ? "Building…" : "Show me"}
        </button>
      </div>

      {!html && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => ask(e)}
              disabled={busy}
              className="rounded-full border border-line px-3 py-1.5 text-sm text-dim hover:border-dim hover:text-ink"
            >
              {e.length > 42 ? e.slice(0, 40) + "…" : e}
            </button>
          ))}
        </div>
      )}

      {err && <p className="mt-4 text-sm text-amber">{err}</p>}

      <div className="mt-6 flex-1">
        {busy && !html && (
          <div className="flex h-[520px] items-center justify-center rounded-xl border border-line bg-panel">
            <span className="animate-pulse font-mono text-sm text-dim">
              drawing your answer…
            </span>
          </div>
        )}

        {html && (
          <div className="overflow-hidden rounded-xl border border-line bg-void">
            <iframe
              key={html.length + (prior ?? "")}
              srcDoc={html}
              sandbox="allow-scripts"
              className="h-[520px] w-full"
              title="animation"
            />
            {live === false && (
              <div className="border-t border-line px-4 py-2 font-mono text-xs text-dim">
                pre-built example · add a key to generate any question live
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
