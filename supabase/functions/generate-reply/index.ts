/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const languageNames: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ar: "Arabic",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { heardText, replyLanguage, sourceLanguage } = await req.json();

    if (!heardText || !replyLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: heardText and replyLanguage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const replyLangName = languageNames[replyLanguage] || replyLanguage;

    console.log(`Generating reply for: "${heardText}" from ${sourceLangName} to ${replyLangName}`);

    const systemPrompt = `You are a helpful conversation assistant. The user understands ${sourceLangName} but needs help formulating natural, fluent replies in ${replyLangName}.

Your task:
1. Understand what was said to the user (in ${sourceLangName})
2. Generate a natural, contextually appropriate reply in ${replyLangName}
3. Keep the reply conversational, friendly, and natural-sounding
4. Match the formality level of the original message
5. If the original is a question, provide a helpful answer
6. If the original is a statement, provide an appropriate response

IMPORTANT:
- Only output the reply in ${replyLangName}, nothing else
- Do not include translations or explanations
- Keep responses concise but complete (1-3 sentences typically)
- Make the reply sound like a native speaker would say it`;

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Someone said to me: "${heardText}"\n\nGenerate a natural reply in ${replyLangName}:` },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("No reply generated");
    }

    console.log(`Generated reply: "${reply}"`);

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating reply:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate reply";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
