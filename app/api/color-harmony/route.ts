// app/api/color-harmony/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensure Node runtime, not edge

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ReqItem = { name?: string; colorHex?: string; colorName?: string };

type Harmony = {
  harmonyType: string;
  explanation: string;
  styleNotes?: string;
  weatherMatch?: string;
  paletteMood?: string;
  confidence?: number;
};

const SYSTEM_PROMPT = `
You are a fashion color expert. Analyze how a set of garment colors work together.
Speak as a helpful stylist: concise, concrete, and friendly.
Focus on relationships: temperature (warm/cool), contrast, saturation, lightness, and color wheel geometry (analogous, complementary, triadic, neutral+accent, monochromatic, mixed).
Offer practical styling tips and consider weather context.

Return STRICT JSON ONLY with keys:
- harmonyType (string)
- explanation (string)
- styleNotes (string)
- weatherMatch (string)
- paletteMood (string)
- confidence (number 0..1)
Do not include any extra text.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: ReqItem[] = Array.isArray(body?.items) ? body.items : [];
    const occasion: string = body?.occasion ?? "";
    const weather: { temperature?: number; condition?: string } = body?.weather ?? {};

    if (!items.length) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }

    const palette = items.map((it, i) => ({
      i,
      name: (it.name || "").toString().slice(0, 40),
      colorHex: it.colorHex || "",
      colorName: it.colorName || "",
    }));

    const userPayload = {
      occasion,
      weather,
      palette,
      instructions:
        "Assess harmony and provide short, actionable notes. Keep it under ~120 words.",
    };

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      response_format: { type: "json_object" },
    });

    const raw = resp.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as Harmony;

    const result: Harmony = {
      harmonyType: parsed?.harmonyType || "Mixed",
      explanation: parsed?.explanation || "A balanced combination of tones.",
      styleNotes: parsed?.styleNotes || "Anchor with a neutral piece to balance colors.",
      weatherMatch:
        parsed?.weatherMatch ||
        (typeof weather?.temperature === "number"
          ? weather.temperature >= 80
            ? "Hot weather: lighter fabrics and airy tones work best."
            : "Cooler days: deeper tones and strong contrasts feel right."
          : ""),
      paletteMood: parsed?.paletteMood || "clean & modern",
      confidence: typeof parsed?.confidence === "number" ? parsed.confidence : 0.7,
    };

    return NextResponse.json({ colorHarmony: result });
  } catch (err: any) {
    console.error("color-harmony error:", err?.message || err);
    return NextResponse.json({ error: "AI color harmony failed" }, { status: 500 });
  }
}
