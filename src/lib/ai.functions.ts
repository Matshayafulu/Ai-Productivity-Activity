import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AiInput = z.object({
  system: z.string().min(1),
  prompt: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

export type AiResult = { text: string; error?: string };

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AiInput.parse(data))
  .handler(async ({ data }): Promise<AiResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { text: "", error: "AI is not configured for this app yet." };

    const messages = [
      { role: "system", content: data.system },
      ...(data.history ?? []),
      { role: "user", content: data.prompt },
    ];

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({ model: "google/gemini-3.8-flash", messages }),
      });
    } catch {
      return { text: "", error: "Could not reach the AI service. Please try again." };
    }

    if (!res.ok) {
      if (res.status === 429)
        return { text: "", error: "Too many requests right now. Please wait a moment and retry." };
      if (res.status === 402)
        return { text: "", error: "AI credits are exhausted. Please add credits to continue." };
      const body = await res.text().catch(() => "");
      return { text: "", error: `AI request failed (${res.status}). ${body.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { text: "", error: "The AI returned an empty response. Please try again." };
    return { text };
  });
