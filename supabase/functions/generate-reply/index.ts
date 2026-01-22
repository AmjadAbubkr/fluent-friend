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
    const { heardText, replyLanguage, sourceLanguage, mode = "reply" } = await req.json();

    if (!heardText || !replyLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: heardText and replyLanguage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const replyLangName = languageNames[replyLanguage] || replyLanguage;

    console.log(`Processing request: mode=${mode}, text="${heardText}", source=${sourceLangName}, target=${replyLangName}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "translate") {
      systemPrompt = `You are a professional translator. 
      Your task is to translate the text EXACTLY from ${sourceLangName} to ${replyLangName}.
      
      IMPORTANT:
      - Output ONLY the translated text. 
      - Do not add explanations, notes, or extra punctuation.
      - Maintain the original tone and meaning.`;

      userPrompt = `Translate the following to ${replyLangName}: "${heardText}"`;
    } else {
      // Default: Reply Mode (Helper)
      systemPrompt = `You are a helpful conversation assistant. The user understands ${sourceLangName} but needs help formulating natural, fluent replies in ${replyLangName}.

      Your task:
      1. Understand what was said to the user (in ${sourceLangName})
      2. Generate a natural, contextually appropriate reply in ${replyLangName}
      3. Keep the reply conversational, friendly, and natural-sounding
      4. Match the formality level of the original message
      
      IMPORTANT:
      - Only output the reply in ${replyLangName}, nothing else
      - Do not include translations or explanations
      - Keep responses concise but complete (1-3 sentences typically)`;

      userPrompt = `Someone said: "${heardText}"\n\nGenerate a natural reply in ${replyLangName}:`;
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro", // Switching to pro for better translation accuracy
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: mode === "translate" ? 0.3 : 0.7, // Lower temperature for translation accuracy
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
      throw new Error("No output generated");
    }

    console.log(`Generated output: "${reply}"`);

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
