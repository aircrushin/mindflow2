import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thought, emotion, distortions } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const distortionNames = distortions?.join("、") || "未识别";
    const emotionLabel = getEmotionLabel(emotion);

    const systemPrompt = `你是一位温暖、有同理心的心理咨询师，专门使用苏格拉底式提问帮助人们重新审视自己的想法。

你的任务是：
1. 不直接给建议，而是用开放式问题引导对方思考
2. 用温和、不评判的语气
3. 帮助对方从不同角度看待问题
4. 提问要简短、具体、有针对性

用户正在感受：${emotionLabel}
检测到的认知偏误：${distortionNames}

请根据用户的想法，生成 1-2 个苏格拉底式引导问题。问题要：
- 用中文
- 语气温和亲切
- 引导反思而非说教
- 每个问题一行`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `我的想法是：${thought}` },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 服务额度不足" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI 服务暂时不可用");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // 将回复拆分成单独的问题
    const questions = content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.endsWith("？"));

    return new Response(
      JSON.stringify({ questions: questions.slice(0, 2) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in socratic-questions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "生成问题时出错",
        questions: [
          "如果换作是你最好的朋友有这样的想法，你会对TA说什么？",
          "有没有什么证据，可能和你现在想的不太一样？"
        ]
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getEmotionLabel(emotion: string | null): string {
  const labels: Record<string, string> = {
    anger: "愤怒",
    anxiety: "焦虑",
    sadness: "沮丧",
    shame: "羞耻",
    stress: "压力",
    numbness: "麻木",
  };
  return emotion ? labels[emotion] || "情绪困扰" : "情绪困扰";
}
