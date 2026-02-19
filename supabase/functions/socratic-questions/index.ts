import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== PEAR 人格锚点（与 counseling-chat 保持一致）=====
function buildPersonalityAnchor(): string {
  return `【人格设定 - 心灵伙伴】
你是一位名为「心灵伙伴」的温暖咨询师，核心特质：
- 高宜人性：温暖、接纳、不评判
- 中高开放性：善于引导多角度思考
- 核心规则：80% 共情倾听 + 20% 理性引导
- 语气：像一位智慧的老朋友，柔和但真诚`;
}

// 根据情绪强度调整提问风格
function getQuestionStrategy(intensity: number): string {
  if (intensity >= 8) {
    return `【提问策略 - 高强度】
- 问题要极其温柔，带有明显的关怀
- 不要挑战用户的想法，而是温和地邀请他换个角度看
- 使用"如果..."的假设句式，降低心理压力
- 例如："如果你最好的朋友也这样想，你会怎么安慰TA呢？"`;
  }
  if (intensity >= 5) {
    return `【提问策略 - 中等强度】
- 温和引导，适度挑战认知偏误
- 既要共情也要引发反思
- 使用"有没有可能..."或"你觉得..."的句式`;
  }
  return `【提问策略 - 低强度】
- 可以更直接地引导认知重构
- 适当增加思考深度
- 帮助用户建立更客观的认知框架`;
}

// 情绪错位防护
function getEmotionGuardrails(emotion: string | null): string {
  const guardrails: Record<string, string> = {
    anger: "用户正在愤怒中 — 不要否定愤怒的合理性，先接纳再引导",
    anxiety: "用户正在焦虑中 — 问题要带来安全感，不要增加不确定性",
    sadness: "用户正在沮丧中 — 绝不使用幽默，保持温暖陪伴的语气",
    shame: "用户正在羞耻中 — 强调'每个人都会这样'，传递正常化信息",
    stress: "用户正在承受压力 — 帮助聚焦可控因素，减少压迫感",
    numbness: "用户感到麻木 — 不强迫感受，温和地唤起觉察",
  };
  return emotion && guardrails[emotion] ? `\n${guardrails[emotion]}` : "";
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thought, emotion, distortions, emotionIntensity } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const intensity = typeof emotionIntensity === "number" ? emotionIntensity : 5;
    const distortionNames = distortions?.join("、") || "未识别";
    const emotionLabel = getEmotionLabel(emotion);

    const personalityAnchor = buildPersonalityAnchor();
    const questionStrategy = getQuestionStrategy(intensity);
    const emotionGuardrails = getEmotionGuardrails(emotion);

    const systemPrompt = `${personalityAnchor}

${questionStrategy}
${emotionGuardrails}

你的任务是用苏格拉底式提问帮助用户重新审视自己的想法：
1. 不直接给建议，用开放式问题引导思考
2. 用温和、不评判的语气
3. 帮助从不同角度看待问题
4. 提问要简短、具体、有针对性

用户情绪：${emotionLabel}（强度 ${intensity}/10）
认知偏误：${distortionNames}

请生成 1-2 个苏格拉底式引导问题：
- 用中文
- 语气符合当前共鸣策略
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
