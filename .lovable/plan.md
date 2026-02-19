

# PEAR 心理认知架构集成方案

## 概述

将 PEAR（Personality-Emotion-Awareness-Resonance）心理认知架构融入现有 CBT 工具的 AI 能力中，主要通过重构两个 Edge Function 的 system prompt 和新增情绪上下文传递逻辑来实现。

---

## 一、改造范围

当前项目有两个 AI 交互点：
1. **苏格拉底式提问**（`socratic-questions`）：根据用户自动思维生成引导问题
2. **心理疏导聊天**（`counseling-chat`）：实时陪伴对话

两者的 prompt 目前都比较简单，缺乏人格一致性、情绪深度感知、动态共鸣调节和自我觉知能力。

---

## 二、具体改造内容

### 1. Personality 人格映射层 -- 统一 AI 人格设定

**改动文件**: `supabase/functions/counseling-chat/index.ts`, `supabase/functions/socratic-questions/index.ts`

在两个 Edge Function 中建立统一的人格锚点常量，确保 AI 在所有交互场景中保持一致的 "心灵伙伴" 人格：

- 定义人格向量参数（高宜人性、中高开放性、低神经质）
- 设定核心人格规则：80% 共情 + 20% 理性引导
- 统一回应风格：温暖倾听者，语气柔和但不过度讨好

### 2. Emotion 情绪感知层 -- 增强情绪上下文传递

**改动文件**: `src/components/cbt/CounselingChat.tsx`, `supabase/functions/counseling-chat/index.ts`

当前只传递 `emotion`（情绪类型）和 `automaticThought`，缺少情绪强度和身体感受等关键维度。

- 前端：将 `emotionIntensity`（情绪强度）和 `bodySensation`（身体感受）也传递给聊天组件和 Edge Function
- 后端：构建 PAD 三维情感上下文（基于情绪类型推断愉悦度，用强度值映射唤醒度），写入 system prompt
- 在 `Step2CognitiveRestructuring.tsx` 中补充传递 `emotionIntensity` 和 `bodySensation` 给 `CounselingChat`

### 3. Awareness 自我觉知层 -- 对话记忆与策略调整

**改动文件**: `supabase/functions/counseling-chat/index.ts`

在 system prompt 中加入元认知指令：

- 要求 AI 追踪对话中用户情绪变化（通过分析上下文消息的情绪走向）
- 加入叙事张力管理规则：连续 3 轮用户情绪未改善时切换策略（从共情转向引导行动）
- 加入情绪反馈循环指令：根据用户对前一条回复的反应调整下一条的风格

### 4. Resonance 动态共鸣层 -- 情绪同频响应

**改动文件**: `supabase/functions/counseling-chat/index.ts`, `supabase/functions/socratic-questions/index.ts`

根据情绪强度动态调整共鸣策略：

- 强度 >= 8（高）：90% 共情 + 10% 陪伴，不引导、不分析，先稳定情绪
- 强度 5-7（中）：60% 共情 + 30% 引导 + 10% 正念提示
- 强度 <= 4（低）：40% 共情 + 40% 认知引导 + 20% 行动建议
- 避免情绪错位规则（悲伤时不用幽默，愤怒时不说教）

---

## 三、技术细节

### 前端改动

**文件 `src/components/cbt/Step2CognitiveRestructuring.tsx`**:
- 新增 props: `emotionIntensity: number`, `bodySensation: string`
- 透传给 `CounselingChat` 组件

**文件 `src/components/cbt/CounselingChat.tsx`**:
- 接收并在 API 调用中传递 `emotionIntensity` 和 `bodySensation`

**文件 `src/components/cbt/CBTApp.tsx`**:
- 将 `state.emotionIntensity` 和 `state.bodySensation` 传递给 Step2 组件

### 后端改动

**文件 `supabase/functions/counseling-chat/index.ts`**:
- 新增 `buildPersonalityAnchor()` 函数，返回人格设定文本
- 新增 `buildEmotionContext()` 函数，基于情绪类型 + 强度 + 身体感受构建 PAD 三维描述
- 新增 `getResonanceStrategy()` 函数，根据强度返回共鸣比例配置
- 重构 system prompt，整合四层 PEAR 指令

**文件 `supabase/functions/socratic-questions/index.ts`**:
- 接收 `emotionIntensity` 参数
- 加入人格一致性指令和动态共鸣规则
- 高强度时生成更柔和的问题，低强度时适当增加认知挑战

---

## 四、改动文件清单

| 文件 | 改动类型 |
|------|----------|
| `supabase/functions/counseling-chat/index.ts` | 重构 prompt + 新增 PEAR 逻辑函数 |
| `supabase/functions/socratic-questions/index.ts` | 增强 prompt + 接收强度参数 |
| `src/components/cbt/CounselingChat.tsx` | 新增 props 传递 |
| `src/components/cbt/Step2CognitiveRestructuring.tsx` | 新增 props 接收与透传 |
| `src/components/cbt/CBTApp.tsx` | 补充传递 emotionIntensity 和 bodySensation |

不需要新建数据库表或修改现有表结构，所有改动集中在 prompt 工程和前端上下文传递。

