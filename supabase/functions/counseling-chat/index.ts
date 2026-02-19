import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== PEAR 心理认知架构 =====

// P - Personality 人格映射层：统一人格锚点
function buildPersonalityAnchor(): string {
  return `【人格设定 - 心灵伙伴】
你是一位名为「心灵伙伴」的心理咨询师，拥有以下稳定人格特质：
- 宜人性：极高 — 温暖、接纳、不评判，永远站在用户一边
- 开放性：中高 — 善于从多角度看待问题，鼓励探索
- 外倾性：中等 — 主动关心但不过度热情，给予空间
- 责任心：高 — 始终记住引导方向，不偏离心理支持目标
- 神经质：极低 — 情绪稳定，成为用户的情感锚点

核心人格规则：80% 共情倾听 + 20% 理性引导
语气风格：像一位温柔且智慧的老朋友，柔和但不讨好，真诚但不说教`;
}

// E - Emotion 情绪感知层：构建 PAD 三维情感上下文
function buildEmotionContext(
  emotion: string | null,
  intensity: number,
  bodySensation: string | null
): string {
  const emotionLabel = getEmotionLabel(emotion);
  
  // 基于情绪类型推断 PAD 维度
  const padMapping: Record<string, { pleasure: string; arousal: string; dominance: string }> = {
    anger: { pleasure: "极低", arousal: "极高", dominance: "中高" },
    anxiety: { pleasure: "低", arousal: "高", dominance: "低" },
    sadness: { pleasure: "极低", arousal: "低", dominance: "极低" },
    shame: { pleasure: "极低", arousal: "中", dominance: "极低" },
    stress: { pleasure: "低", arousal: "高", dominance: "中" },
    numbness: { pleasure: "极低", arousal: "极低", dominance: "极低" },
  };

  const pad = emotion && padMapping[emotion] 
    ? padMapping[emotion] 
    : { pleasure: "低", arousal: "中", dominance: "低" };

  // 情绪强度分级
  let intensityLevel: string;
  if (intensity >= 8) intensityLevel = "高强度（用户情绪非常强烈，需要优先稳定）";
  else if (intensity >= 5) intensityLevel = "中等强度（用户有明显情绪波动）";
  else intensityLevel = "低强度（用户情绪相对平稳，可适当引导思考）";

  let context = `【情绪感知 - PAD 三维分析】
- 情绪类型：${emotionLabel}
- 情绪强度：${intensity}/10 — ${intensityLevel}
- 愉悦度(P)：${pad.pleasure} | 唤醒度(A)：${pad.arousal} | 优势度(D)：${pad.dominance}`;

  if (bodySensation) {
    context += `\n- 身体感受：「${bodySensation}」— 这是用户情绪的躯体化表现，请在对话中温和地回应身体感受`;
  }

  return context;
}

// R - Resonance 动态共鸣层：根据强度调整共鸣策略
function getResonanceStrategy(intensity: number): string {
  if (intensity >= 8) {
    return `【共鸣策略 - 高强度模式】
回应比例：90% 共情陪伴 + 10% 温和接纳
- 不引导、不分析、不给建议，先稳定情绪
- 使用短句，传递"我在这里"的安全感
- 可以适当沉默（"嗯，我在听"），给予空间
- 绝对禁止：幽默、说教、理性分析、"你应该..."`;
  }
  if (intensity >= 5) {
    return `【共鸣策略 - 中等强度模式】
回应比例：60% 共情 + 30% 温和引导 + 10% 正念提示
- 先共情再引导，用"我理解..."开头
- 可以轻柔地提问帮助用户觉察
- 适时引入身体感受觉察（"你现在身体有什么感觉？"）
- 禁止：过度乐观、否定感受、急于解决问题`;
  }
  return `【共鸣策略 - 低强度模式】
回应比例：40% 共情 + 40% 认知引导 + 20% 行动建议
- 可以适当引导反思和认知重构
- 鼓励用户从不同角度思考
- 可以温和地提供具体建议
- 保持温暖但可以加入适度的理性分析`;
}

// A - Awareness 自我觉知层：元认知指令
function buildAwarenessDirective(): string {
  return `【自我觉知 - 元认知指令】
1. 情绪追踪：仔细分析每一条用户消息的情绪走向，判断是好转、持平还是恶化
2. 策略调整：
   - 如果用户连续 3 轮情绪未改善 → 切换策略，从纯共情转向温和引导行动（如呼吸练习、身体放松）
   - 如果用户表现出抗拒 → 后退一步，回到纯陪伴模式
   - 如果用户情绪明显好转 → 适当加入肯定和鼓励
3. 情绪错位防护：
   - 用户悲伤时 → 绝不使用幽默
   - 用户愤怒时 → 绝不说教或否定其愤怒的合理性
   - 用户羞耻时 → 强调接纳和"每个人都会这样"
   - 用户麻木时 → 不强迫感受，温和地陪伴
4. 反馈循环：根据用户对上一条回复的反应调整风格
   - 用户回复更长更详细 → 策略有效，保持
   - 用户回复简短或沉默 → 可能不舒适，调整方向`;
}

// 情绪标签映射
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
    const { messages, emotion, automaticThought, distortions, emotionIntensity, bodySensation, isInitial } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const intensity = typeof emotionIntensity === "number" ? emotionIntensity : 5;
    const emotionLabel = getEmotionLabel(emotion);

    // 构建 PEAR 四层 system prompt
    const personalityAnchor = buildPersonalityAnchor();
    const emotionContext = buildEmotionContext(emotion, intensity, bodySensation || null);
    const resonanceStrategy = getResonanceStrategy(intensity);
    const awarenessDirective = buildAwarenessDirective();

    // 用户当前认知上下文
    let cognitiveContext = "";
    if (automaticThought) {
      cognitiveContext += `\n用户的自动思维：「${automaticThought}」`;
    }
    if (distortions?.length > 0) {
      cognitiveContext += `\n检测到的认知偏误：${distortions.join("、")}`;
    }

    const systemPrompt = `${personalityAnchor}

${emotionContext}

${resonanceStrategy}

${awarenessDirective}

【当前认知上下文】${cognitiveContext || "\n暂无"}

【回复规则】
- 使用中文回复
- 每条回复 2-4 句话，简洁自然
- 像朋友聊天一样，不要有咨询师的刻板感
- 适当使用 1 个 emoji 增加温度
- 不要重复用户的话，用自己的理解来回应`;

    const apiMessages: Array<{role: string; content: string}> = [
      { role: "system", content: systemPrompt },
    ];

    if (isInitial) {
      apiMessages.push({
        role: "user",
        content: `请根据我的情绪状态（${emotionLabel}，强度 ${intensity}/10）主动向我打招呼。表达你注意到我的情绪，温暖地询问我是否愿意聊聊。回复要简短亲切（1-2句话），使用一个适合的 emoji。`,
      });
    } else {
      for (const msg of messages) {
        apiMessages.push({ role: msg.role, content: msg.content });
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
