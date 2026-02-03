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
    const { messages, emotion, automaticThought, distortions, isInitial } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const emotionLabel = getEmotionLabel(emotion);
    const distortionNames = distortions?.length > 0 ? distortions.join("、") : null;

    // 构建上下文信息
    let contextInfo = `用户当前情绪：${emotionLabel}`;
    if (automaticThought) {
      contextInfo += `\n用户的自动思维：「${automaticThought}」`;
    }
    if (distortionNames) {
      contextInfo += `\n检测到的认知偏误：${distortionNames}`;
    }

    const systemPrompt = `你是一位温暖、有同理心的心理咨询师「心灵伙伴」。你的任务是：

1. 用温暖、友善、不评判的语气与用户交流
2. 主动关心用户的感受，表达理解和接纳
3. 使用简短的回复（2-4句话），避免长篇大论
4. 适时给予鼓励和肯定
5. 引导用户觉察情绪和想法，但不说教

${contextInfo}

重要原则：
- 始终保持温暖和支持性
- 不要直接给建议，而是帮助用户自己探索
- 回复要简洁自然，像朋友聊天一样
- 用中文回复`;

    // 构建消息数组
    const apiMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (isInitial) {
      // 初始化消息：AI 主动问候
      apiMessages.push({
        role: "user",
        content: `请根据我的情绪状态（${emotionLabel}）主动向我打招呼，表达你注意到我的情绪，并温暖地询问我是否愿意聊聊。回复要简短亲切（1-2句话），可以使用一个适合的 emoji。`,
      });
    } else {
      // 对话消息
      for (const msg of messages) {
        apiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        max_tokens: 300,
        temperature: 0.8,
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
    const message = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ message: message.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in counseling-chat:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "聊天服务出错",
        message: null,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
