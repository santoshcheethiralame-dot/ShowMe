import OpenAI from "openai";
import { hasKey, MODEL } from "@/lib/config";
import { SYSTEM, userPrompt } from "@/lib/prompt";
import { fixtureFor } from "@/lib/fixtures";

/** A question in, a self-contained animated HTML document out. */
export async function POST(req: Request) {
  const { question, priorQuestion } = (await req.json()) as {
    question: string;
    priorQuestion?: string;
  };

  if (!question?.trim()) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  // Cached first: keeps the demo bulletproof and keyless testing free.
  const fixture = fixtureFor(question);
  if (fixture) return Response.json({ html: fixture.html, live: false });

  if (!hasKey) {
    return Response.json(
      { error: "no-key", html: NEEDS_KEY(question) },
      { status: 200 },
    );
  }

  try {
    const client = new OpenAI();
    const r = await client.responses.create({
      model: MODEL,
      instructions: SYSTEM,
      input: userPrompt(question, priorQuestion),
      reasoning: { effort: "medium" },
    });
    return Response.json({ html: strip(r.output_text ?? ""), live: true });
  } catch (e) {
    console.error("animate failed:", e);
    return Response.json({ error: "generation-failed" }, { status: 500 });
  }
}

/** The model sometimes wraps the document in a code fence; take the doc itself. */
function strip(s: string): string {
  const m = s.match(/<!doctype html[\s\S]*<\/html>/i);
  return m ? m[0] : s.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
}

/** Keyless placeholder for anything not pre-baked. */
const NEEDS_KEY = (q: string) => `<!doctype html><html><body style="margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#0b0b0d;color:#8f8a7e;font-family:ui-monospace,monospace;text-align:center;padding:24px"><div><div style="color:#ffd23e;font-weight:800;font-size:18px;margin-bottom:8px">Live generation needs an API key</div><div>Try the pre-built example, or add OPENAI_API_KEY to generate:<br><br>"${q.replace(/</g, "")}"</div></div></body></html>`;
