
# 登录注册与历史记录功能实施计划

## 功能概述

为 CBT 情绪急救工具添加用户系统和历史记录功能：
- 支持邮箱或用户名登录/注册
- 登录用户的每次情绪急救结果自动保存
- 日历形式的历史记录页面
- 可以回溯查看每次的心情变化详情

---

## 数据库设计

### profiles 表（用户资料）
存储用户的扩展信息，支持用户名登录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，关联 auth.users |
| username | text | 用户名（唯一，可用于登录） |
| email | text | 用户的邮箱 |
| created_at | timestamp | 创建时间 |

### cbt_sessions 表（情绪记录）
存储每次完成的 CBT 练习

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| completed_at | timestamp | 完成时间 |
| custom_emotion | text | 自定义情绪描述 |
| selected_emotion | text | 选择的情绪类型 |
| emotion_intensity | integer | 情绪强度 (0-10) |
| body_sensation | text | 身体感受 |
| automatic_thought | text | 自动思维 |
| detected_distortions | text[] | 检测到的认知偏误 |
| ai_questions | text[] | AI 生成的问题 |
| balanced_thought | text | 平衡思维 |
| selected_action | text | 选择的行动 |

---

## 页面结构

### 新增页面

1. **/auth** - 登录/注册页面
   - 标签页切换：登录 / 注册
   - 登录支持：邮箱或用户名 + 密码
   - 注册需要：用户名 + 邮箱 + 密码
   - 保持鼠尾草绿的品牌风格

2. **/history** - 历史记录页面
   - 日历视图：显示有记录的日期（用颜色标记）
   - 点击日期展开当天的记录列表
   - 每条记录显示：时间、情绪、强度
   - 点击记录查看完整详情

### 修改现有页面

1. **进度条组件** - 添加用户状态
   - 右上角显示用户头像/登录按钮
   - 未登录：显示"登录"按钮
   - 已登录：显示用户名和下拉菜单（历史记录、退出）

2. **完成页面** - 自动保存
   - 登录用户完成练习后自动保存
   - 显示"已保存到历史记录"提示
   - 未登录用户显示"登录后可保存记录"

---

## 技术实现

### 1. 认证上下文
创建 `AuthContext` 管理全局用户状态：
- 监听 `onAuthStateChange` 事件
- 提供 `signIn`、`signUp`、`signOut` 方法
- 自动获取用户 profile 信息

### 2. 用户名登录逻辑
由于数据库不直接支持用户名登录，实现方式：
- 用户输入用户名或邮箱
- 如果输入包含 `@`，直接用邮箱登录
- 否则先查询 profiles 表获取对应邮箱，再登录

### 3. 数据保存时机
- 在 `CompletionCelebration` 组件挂载时
- 如果用户已登录，调用 `saveSession` 保存数据
- 使用 React Query 的 mutation 处理

### 4. 日历组件
- 使用已有的 `react-day-picker` 组件
- 自定义日期单元格样式（有记录的日期高亮）
- 点击日期加载当天的记录

---

## 文件变更清单

### 新建文件

```text
src/contexts/AuthContext.tsx     # 认证上下文
src/pages/Auth.tsx               # 登录/注册页面
src/pages/History.tsx            # 历史记录页面
src/components/history/          # 历史记录相关组件
  ├── HistoryCalendar.tsx        # 日历视图
  ├── SessionList.tsx            # 记录列表
  └── SessionDetail.tsx          # 记录详情
src/components/cbt/UserMenu.tsx  # 用户菜单组件
src/hooks/useCBTHistory.ts       # 历史数据查询 hook
```

### 修改文件

```text
src/App.tsx                      # 添加路由和 AuthProvider
src/components/cbt/ProgressBar.tsx    # 添加用户菜单
src/components/cbt/CompletionCelebration.tsx  # 添加保存逻辑
src/hooks/useCBTSession.ts       # 添加 getSessionData 方法
```

---

## 安全设计

### RLS 策略

**profiles 表**
- SELECT: 所有已认证用户可查询（用于用户名登录查询）
- INSERT: 仅能插入自己的 profile
- UPDATE: 仅能更新自己的 profile

**cbt_sessions 表**
- SELECT: 仅能查看自己的记录
- INSERT: 仅能插入 user_id = auth.uid() 的记录
- UPDATE/DELETE: 不允许（保持记录完整性）

---

## 用户体验流程

```text
未登录用户：
┌─────────────────────────────────────────────────┐
│  使用 CBT 工具 → 完成练习 → 提示"登录可保存"   │
│                    ↓                             │
│              点击登录按钮                        │
│                    ↓                             │
│           跳转登录页 → 登录成功                 │
│                    ↓                             │
│           返回首页，下次记录自动保存             │
└─────────────────────────────────────────────────┘

已登录用户：
┌─────────────────────────────────────────────────┐
│  使用 CBT 工具 → 完成练习 → 自动保存           │
│                    ↓                             │
│           显示"已保存"提示                      │
│                    ↓                             │
│     点击用户头像 → 历史记录 → 日历视图         │
│                    ↓                             │
│          选择日期 → 查看当天记录详情            │
└─────────────────────────────────────────────────┘
```

---

## 界面设计

### 登录页面
- 居中卡片布局，延续圆角风格
- 顶部：logo + 应用名
- 标签切换：登录 / 注册
- 输入框：圆角、柔和边框
- 按钮：鼠尾草绿主色

### 历史记录页面
- 顶部：月份切换导航
- 日历：有记录的日期用薰衣草紫点标记
- 下方：选中日期的记录列表
- 点击记录展开详情抽屉

### 详情抽屉
- 显示完整的三步信息
- 情绪强度以温度计形式呈现
- AI 问题以卡片形式展示
- 底部显示完成时间

---

## 实施顺序

1. **数据库迁移** - 创建 profiles 和 cbt_sessions 表
2. **认证上下文** - 实现 AuthContext
3. **登录/注册页面** - 完成 Auth 页面
4. **用户菜单** - 修改进度条添加用户入口
5. **保存功能** - 修改完成页面自动保存
6. **历史记录页面** - 实现日历和详情查看
7. **测试验证** - 完整流程测试

