// CBT 工具类型定义

export type EmotionType = 'anger' | 'anxiety' | 'sadness' | 'shame' | 'stress' | 'numbness';

export interface EmotionOption {
  id: EmotionType;
  label: string;
  icon: string;
  color: string;
}

export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface ActionRecommendation {
  id: string;
  emotionType: EmotionType;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export interface CBTSessionState {
  step: 1 | 2 | 3;
  // Step 1
  customEmotion: string;
  emotionIntensity: number;
  selectedEmotion: EmotionType | null;
  bodySensation: string;
  // Step 2
  automaticThought: string;
  detectedDistortions: string[];
  aiQuestions: string[];
  balancedThought: string;
  // Step 3
  selectedAction: string | null;
  actionCompleted: boolean;
  // Crisis
  showCrisisIntervention: boolean;
}

export const EMOTIONS: EmotionOption[] = [
  { id: 'anger', label: '愤怒', icon: '😤', color: 'sage' },
  { id: 'anxiety', label: '焦虑', icon: '😰', color: 'sage' },
  { id: 'sadness', label: '沮丧', icon: '😢', color: 'sage' },
  { id: 'shame', label: '羞耻', icon: '😳', color: 'sage' },
  { id: 'stress', label: '压力', icon: '😫', color: 'sage' },
  { id: 'numbness', label: '麻木', icon: '😶', color: 'sage' },
];

export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: 'catastrophizing',
    name: '灾难化',
    description: '把事情往最坏的方向想',
    keywords: ['完了', '毁了', '糟糕透了', '不可能', '再也', '肯定完蛋', '没救了', '世界末日'],
  },
  {
    id: 'mind-reading',
    name: '读心术',
    description: '以为知道别人在想什么',
    keywords: ['他一定', '她肯定', '他们觉得', '别人认为', '大家都', '他们会想', '看不起'],
  },
  {
    id: 'all-or-nothing',
    name: '非黑即白',
    description: '只看极端，没有中间地带',
    keywords: ['总是', '从不', '永远', '绝对', '完全', '一定', '必须', '根本'],
  },
  {
    id: 'overgeneralization',
    name: '以偏概全',
    description: '用一次经历推断所有情况',
    keywords: ['每次', '所有人', '没有人', '任何', '全部', '都是这样', '一直都'],
  },
  {
    id: 'should-statements',
    name: '应该思维',
    description: '用"应该"给自己或他人施压',
    keywords: ['应该', '必须', '不应该', '不能', '一定要', '怎么能'],
  },
  {
    id: 'personalization',
    name: '过度自责',
    description: '把不相关的事情归咎于自己',
    keywords: ['都怪我', '是我的错', '如果我', '都因为我', '我害的'],
  },
];

export const ACTION_RECOMMENDATIONS: ActionRecommendation[] = [
  // 焦虑
  { id: 'box-breathing', emotionType: 'anxiety', title: '盒式呼吸', description: '吸气4秒→屏息4秒→呼气4秒→屏息4秒，重复3次', duration: '2分钟', icon: '🌬️' },
  { id: 'grounding', emotionType: 'anxiety', title: '5-4-3-2-1 接地练习', description: '说出5样你能看到的，4样能摸到的，3样能听到的...', duration: '3分钟', icon: '🌱' },
  { id: 'cold-water-anxiety', emotionType: 'anxiety', title: '冷水洗手', description: '用冷水冲洗手腕内侧30秒', duration: '1分钟', icon: '💧' },
  
  // 愤怒
  { id: 'cold-water-face', emotionType: 'anger', title: '冷水洗脸', description: '用冷水拍打脸颊，激活迷走神经', duration: '1分钟', icon: '🧊' },
  { id: 'physical-release', emotionType: 'anger', title: '身体释放', description: '做10个深蹲或拍打枕头', duration: '2分钟', icon: '💪' },
  { id: 'count-backwards', emotionType: 'anger', title: '倒数呼吸', description: '从100开始倒数，每个数字配合一次呼吸', duration: '3分钟', icon: '🔢' },
  
  // 沮丧
  { id: 'walk-50-steps', emotionType: 'sadness', title: '出门走50步', description: '离开当前空间，走到户外感受阳光', duration: '3分钟', icon: '🚶' },
  { id: 'music', emotionType: 'sadness', title: '听一首振奋的歌', description: '选一首你喜欢的充满能量的音乐', duration: '4分钟', icon: '🎵' },
  { id: 'gratitude', emotionType: 'sadness', title: '写三件感恩的事', description: '今天有什么小事值得感谢？', duration: '2分钟', icon: '🙏' },
  
  // 羞耻
  { id: 'self-compassion', emotionType: 'shame', title: '自我安慰', description: '把手放在心口，对自己说三句温暖的话', duration: '2分钟', icon: '💝' },
  { id: 'normalize', emotionType: 'shame', title: '正常化练习', description: '想想有多少人也经历过类似的事', duration: '2分钟', icon: '🤝' },
  { id: 'letter', emotionType: 'shame', title: '给自己写封信', description: '像对待好朋友那样写几句话给自己', duration: '4分钟', icon: '✉️' },
  
  // 压力
  { id: 'stretch', emotionType: 'stress', title: '简单拉伸', description: '转动脖子、耸肩、活动手腕', duration: '2分钟', icon: '🧘' },
  { id: 'tea', emotionType: 'stress', title: '泡一杯茶', description: '专注于泡茶的每一个步骤', duration: '5分钟', icon: '🍵' },
  { id: 'brain-dump', emotionType: 'stress', title: '大脑清空', description: '把脑海里的事情全部写在纸上', duration: '3分钟', icon: '📝' },
  
  // 麻木
  { id: 'sensory', emotionType: 'numbness', title: '感官唤醒', description: '吃一颗糖或闻一下咖啡豆', duration: '1分钟', icon: '🍬' },
  { id: 'movement', emotionType: 'numbness', title: '活动身体', description: '原地跳跃或甩动手臂', duration: '2分钟', icon: '🦘' },
  { id: 'texture', emotionType: 'numbness', title: '触感体验', description: '触摸不同材质的物品，感受差异', duration: '2分钟', icon: '🧸' },
];

// 危机关键词
export const CRISIS_KEYWORDS = [
  '自杀', '不想活', '想死', '活着没意思', '结束生命', '离开这个世界',
  '自残', '伤害自己', '割', '跳楼', '吃药', '死了算了',
];
