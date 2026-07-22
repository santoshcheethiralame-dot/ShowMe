import OpenAI from "openai";
import { hasKey, MODEL } from "@/lib/config";
import { SYSTEM, userPrompt } from "@/lib/prompt";
import { fixtureFor } from "@/lib/fixtures";

/**
 * A question in, an animated HTML document streamed out as raw text. The client
 * shows the code being written live, then renders the finished document in a
 * sandboxed iframe. The `x-showme-live` header says whether a real model wrote
 * it or it came from the pre-baked set.
 */
export async function POST(req: Request) {
  const { question, priorQuestion } = (await req.json()) as {
    question: string;
    priorQuestion?: string;
  };

  if (!question?.trim()) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const enc = new TextEncoder();
  const fixture = fixtureFor(question);

  // Cached: stream it in one chunk so the client code path is identical.
  if (fixture) {
    return new Response(fixture.html, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-showme-live": "false" },
    });
  }

  if (!hasKey) {
    return new Response(NEEDS_KEY(question), {
      headers: { "content-type": "text/plain; charset=utf-8", "x-showme-live": "false" },
    });
  }

  const client = new OpenAI();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await client.responses.create({
          model: MODEL,
          instructions: SYSTEM,
          input: userPrompt(question, priorQuestion),
          reasoning: { effort: "low" },
          stream: true,
        });
        for await (const event of s) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(enc.encode(event.delta));
          }
        }
      } catch (e) {
        console.error("animate stream failed:", e);
        controller.enqueue(enc.encode(ERROR_DOC));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-showme-live": "true",
      "cache-control": "no-cache",
    },
  });
}

const ERROR_DOC = `<!doctype html><!--EXPLAIN: The generator hit an error. Try rephrasing the question.--><html><body style="margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#0f1613;color:#ff6f5e;font-family:system-ui;font-weight:700">Couldn't draw that one — try rephrasing.</body></html>`;

const NEEDS_KEY = (q: string) =>
  `<!doctype html><!--EXPLAIN: Live generation needs an OpenAI API key. Try a pre-built example instead.--><html><body style="margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#0f1613;color:#8f8a7e;font-family:ui-monospace,monospace;text-align:center;padding:24px"><div><div style="color:#ffd23e;font-weight:800;font-size:18px;margin-bottom:8px">Live generation needs an API key</div><div>Try a pre-built example, or add OPENAI_API_KEY to draw:<br><br>"${q.replace(/[<>]/g, "")}"</div></div></body></html>`;
