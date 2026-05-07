import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { question, context } = await req.json();

    // Fetch user data for context
    const [profileRes, sessionsRes, answersRes] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("id", user.id).single(),
      supabaseClient.from("study_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabaseClient.from("user_answers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    const profile = profileRes.data;
    const sessions = sessionsRes.data || [];
    const answers = answersRes.data || [];

    const totalStudyMin = sessions.reduce((s: number, x: any) => s + (x.duracao_min || 0), 0);
    const correctAnswers = answers.filter((a: any) => a.correto).length;
    const totalAnswers = answers.length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    const weakAreas = new Map<string, { correct: number; total: number }>();
    for (const a of answers) {
      const key = a.materia || "Geral";
      const entry = weakAreas.get(key) || { correct: 0, total: 0 };
      entry.total++;
      if (a.correto) entry.correct++;
      weakAreas.set(key, entry);
    }

    let weakSubjects: string[] = [];
    weakAreas.forEach((v, k) => {
      if (v.total >= 3 && (v.correct / v.total) < 0.6) weakSubjects.push(k);
    });

    const systemPrompt = `Você é o Coach FOCO LEVE, um assistente de estudos especializado em preparação para o ENEM.
Seu papel é motivar, orientar e dar dicas práticas e personalizadas.

DADOS DO ALUNO:
- Nível: ${profile?.level || 1}
- XP Total: ${profile?.xp_total || 0}
- Streak: ${profile?.streak_dias || 0} dias
- Perfil Cognitivo: ${profile?.cognitive_profile || "iniciante"}
- Total estudado: ${totalStudyMin} minutos
- Acurácia em simulados: ${accuracy}% (${correctAnswers}/${totalAnswers})
- Matérias fracas: ${weakSubjects.length > 0 ? weakSubjects.join(", ") : "Nenhuma identificada ainda"}

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja motivador mas realista
- Dê dicas específicas baseadas nos dados do aluno
- Sugira técnicas de estudo concretas
- Mantenha respostas curtas (máx 200 palavras)
- Use emojis moderadamente
- Se o aluno perguntar algo fora do escopo de estudos/ENEM, redirecione educadamente`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question || "Me dê uma dica de estudo personalizada para hoje." },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta agora.";

    // Log the interaction
    await supabaseClient.from("analytics_events").insert({
      user_id: user.id,
      evento: "ai_coach_interaction",
      metadata: { question: question?.substring(0, 100), context },
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
