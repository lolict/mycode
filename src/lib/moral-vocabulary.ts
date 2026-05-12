/**
 * 道德股权 · 词汇管理体系
 * Moral Equity — Vocabulary Management System
 *
 * 核心设计：
 * - 不硬编码任何用户可见的术语（如"积分"、"德值"）
 * - 所有术语定义为可替换的词汇对象
 * - 管理者可自定义每个词汇的显示值
 * - 支持JSON文档批量导入词汇资源
 *
 * 词汇分类（VocabCategory）：
 * 1. value_unit    — 价值单位：德值/积分/功德/善点...
 * 2. action_type   — 行为类别：捐款/志愿服务/互助...
 * 3. dimension     — 五维名称：善良/恻隐/正义/奉献/严重度
 * 4. level_name    — 等级名称：初善/进善/高善/至善...
 * 5. tier_name     — 品阶名称：德者/善者/仁者/圣者...
 * 6. task_category — 任务类别：日常任务/周常任务/专项任务...
 * 7. difficulty    — 难度名称：简单/普通/困难/传奇...
 * 8. equity_term   — 股权术语：道德股权/德股/善权...
 * 9. module_term   — 模块术语：德系模块的专有词汇
 * 10. system_term  — 系统术语：其他平台通用词汇
 */

// ============================================
// 词汇分类定义
// ============================================

export interface VocabCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isSystem: boolean  // 系统级不可删除
}

export const VOCAB_CATEGORIES: VocabCategory[] = [
  {
    id: 'value_unit',
    name: '价值单位',
    description: '道德价值的计量单位名称，如"德值"、"积分"、"功德"等。这是系统最核心的术语，决定了用户看到的累积单位叫什么。',
    icon: 'Coins',
    color: '#eab308',
    isSystem: true,
  },
  {
    id: 'action_type',
    name: '行为类别',
    description: '善行行为的类型名称，如"捐款"可以改为"布施"、"志愿服务"可以改为"行善"等。每个行为类型都可以独立自定义。',
    icon: 'Heart',
    color: '#ef4444',
    isSystem: true,
  },
  {
    id: 'dimension',
    name: '五维名称',
    description: '道德五维评分的维度名称，如"善良"可以改为"仁心"、"恻隐"可以改为"慈悲"等。这些名称直接影响道德雷达图的标签。',
    icon: 'Radar',
    color: '#8b5cf6',
    isSystem: true,
  },
  {
    id: 'level_name',
    name: '等级名称',
    description: '道德等级的名称体系，从低到高的各级别称谓。如"初善→进善→高善→至善"或"善士→善师→善贤→善圣"等。',
    icon: 'TrendingUp',
    color: '#3b82f6',
    isSystem: true,
  },
  {
    id: 'tier_name',
    name: '品阶名称',
    description: '道德品阶的名称体系，品阶代表在共同体中的道德地位。如"德者→善者→仁者→圣者"等。',
    icon: 'Crown',
    color: '#f97316',
    isSystem: true,
  },
  {
    id: 'task_category',
    name: '任务类别',
    description: '道德任务分类的名称，如"日常任务"可以改为"每日修行"、"周常任务"可以改为"七日功课"等。',
    icon: 'ListChecks',
    color: '#10b981',
    isSystem: true,
  },
  {
    id: 'difficulty',
    name: '难度名称',
    description: '任务难度的名称，如"简单/普通/困难/传奇"可以改为"微善/小善/大善/至善"等。',
    icon: 'Gauge',
    color: '#ec4899',
    isSystem: true,
  },
  {
    id: 'equity_term',
    name: '股权术语',
    description: '道德股权相关的专有术语，如"道德股权"本身可以改为"德股"、"善权"等，"股权总值"可以改为"持有量"等。',
    icon: 'Landmark',
    color: '#6366f1',
    isSystem: true,
  },
  {
    id: 'module_term',
    name: '模块术语',
    description: '德系54模块的专有词汇，如"德器"可以改为"善器"、"德捐"可以改为"善施"等。每个模块都可以有独立的术语映射。',
    icon: 'Puzzle',
    color: '#14b8a6',
    isSystem: false,
  },
  {
    id: 'system_term',
    name: '系统术语',
    description: '平台其他通用词汇，如"善行排行榜"可以改为"德行榜"、"打卡"可以改为"签到"等零散但重要的术语。',
    icon: 'Settings',
    color: '#64748b',
    isSystem: false,
  },
]

// ============================================
// 默认词汇表 — 系统启动时的初始词汇
// ============================================

export interface VocabEntry {
  vocabKey: string
  defaultValue: string
  category: string
  description: string
  scope: 'global' | 'module'
  moduleCode?: string
}

export const DEFAULT_VOCABULARY: VocabEntry[] = [
  // ---- 价值单位 ----
  {
    vocabKey: 'value_unit',
    defaultValue: '德值',
    category: 'value_unit',
    description: '道德价值的计量单位，用于显示用户累积的道德价值数量',
    scope: 'global',
  },
  {
    vocabKey: 'value_unit_plural',
    defaultValue: '德值',
    category: 'value_unit',
    description: '价值单位的复数形式，某些语言中复数与单数不同',
    scope: 'global',
  },

  // ---- 行为类别 ----
  {
    vocabKey: 'action_donate',
    defaultValue: '捐款',
    category: 'action_type',
    description: '向助残项目捐赠资金的行为',
    scope: 'global',
  },
  {
    vocabKey: 'action_volunteer',
    defaultValue: '志愿服务',
    category: 'action_type',
    description: '投入时间和精力为残疾人提供志愿帮助',
    scope: 'global',
  },
  {
    vocabKey: 'action_help',
    defaultValue: '互助',
    category: 'action_type',
    description: '人与人之间的直接帮助行为',
    scope: 'global',
  },
  {
    vocabKey: 'action_share',
    defaultValue: '分享',
    category: 'action_type',
    description: '传播助残信息和公益内容',
    scope: 'global',
  },
  {
    vocabKey: 'action_create_project',
    defaultValue: '创建项目',
    category: 'action_type',
    description: '发起助残公益项目',
    scope: 'global',
  },
  {
    vocabKey: 'action_comment',
    defaultValue: '评论',
    category: 'action_type',
    description: '对项目和善行发表建设性评论',
    scope: 'global',
  },
  {
    vocabKey: 'action_verify',
    defaultValue: '验证',
    category: 'action_type',
    description: '对项目真实性和善行有效性进行验证',
    scope: 'global',
  },

  // ---- 五维名称 ----
  {
    vocabKey: 'dim_kindness',
    defaultValue: '善良',
    category: 'dimension',
    description: '五维评分第一维：利他行为的纯度，权重30%',
    scope: 'global',
  },
  {
    vocabKey: 'dim_compassion',
    defaultValue: '恻隐',
    category: 'dimension',
    description: '五维评分第二维：对弱者的关怀深度，权重25%',
    scope: 'global',
  },
  {
    vocabKey: 'dim_justice',
    defaultValue: '正义',
    category: 'dimension',
    description: '五维评分第三维：对公平的坚持程度，权重20%',
    scope: 'global',
  },
  {
    vocabKey: 'dim_dedication',
    defaultValue: '奉献',
    category: 'dimension',
    description: '五维评分第四维：付出的实际代价，权重15%',
    scope: 'global',
  },
  {
    vocabKey: 'dim_severity',
    defaultValue: '严重度',
    category: 'dimension',
    description: '五维评分第五维：受助者困境的严重程度，权重10%（反向指标）',
    scope: 'global',
  },

  // ---- 等级名称 ----
  {
    vocabKey: 'level_1',
    defaultValue: '初善',
    category: 'level_name',
    description: '等级1：初入道德股权体系的新人',
    scope: 'global',
  },
  {
    vocabKey: 'level_2',
    defaultValue: '进善',
    category: 'level_name',
    description: '等级2：已有所积累的善行者',
    scope: 'global',
  },
  {
    vocabKey: 'level_3',
    defaultValue: '明善',
    category: 'level_name',
    description: '等级3：道德觉悟更高的善行者',
    scope: 'global',
  },
  {
    vocabKey: 'level_4',
    defaultValue: '高善',
    category: 'level_name',
    description: '等级4：资深善行者的称号',
    scope: 'global',
  },
  {
    vocabKey: 'level_5',
    defaultValue: '至善',
    category: 'level_name',
    description: '等级5：道德股权体系的最高等级',
    scope: 'global',
  },

  // ---- 品阶名称 ----
  {
    vocabKey: 'tier_1',
    defaultValue: '德者',
    category: 'tier_name',
    description: '品阶1：入门道德品阶',
    scope: 'global',
  },
  {
    vocabKey: 'tier_2',
    defaultValue: '善者',
    category: 'tier_name',
    description: '品阶2：有所成就的道德品阶',
    scope: 'global',
  },
  {
    vocabKey: 'tier_3',
    defaultValue: '仁者',
    category: 'tier_name',
    description: '品阶3：高尚的道德品阶',
    scope: 'global',
  },
  {
    vocabKey: 'tier_4',
    defaultValue: '义者',
    category: 'tier_name',
    description: '品阶4：德高望重的道德品阶',
    scope: 'global',
  },
  {
    vocabKey: 'tier_5',
    defaultValue: '圣者',
    category: 'tier_name',
    description: '品阶5：最高道德品阶',
    scope: 'global',
  },

  // ---- 任务类别 ----
  {
    vocabKey: 'task_daily',
    defaultValue: '日常任务',
    category: 'task_category',
    description: '每天可以完成的常规道德任务',
    scope: 'global',
  },
  {
    vocabKey: 'task_weekly',
    defaultValue: '周常任务',
    category: 'task_category',
    description: '每周可以完成的周期性任务',
    scope: 'global',
  },
  {
    vocabKey: 'task_monthly',
    defaultValue: '月度任务',
    category: 'task_category',
    description: '每月可以完成的周期性任务',
    scope: 'global',
  },
  {
    vocabKey: 'task_one_time',
    defaultValue: '一次性任务',
    category: 'task_category',
    description: '仅可完成一次的特别任务',
    scope: 'global',
  },
  {
    vocabKey: 'task_special',
    defaultValue: '专项任务',
    category: 'task_category',
    description: '特定场景下的限时专项任务',
    scope: 'global',
  },

  // ---- 难度名称 ----
  {
    vocabKey: 'diff_easy',
    defaultValue: '简单',
    category: 'difficulty',
    description: '最简单的任务难度，几乎不需要额外付出',
    scope: 'global',
  },
  {
    vocabKey: 'diff_medium',
    defaultValue: '普通',
    category: 'difficulty',
    description: '需要一定付出的任务难度',
    scope: 'global',
  },
  {
    vocabKey: 'diff_hard',
    defaultValue: '困难',
    category: 'difficulty',
    description: '需要较大付出的任务难度',
    scope: 'global',
  },
  {
    vocabKey: 'diff_legendary',
    defaultValue: '传奇',
    category: 'difficulty',
    description: '最高难度的任务，需要非凡的付出',
    scope: 'global',
  },

  // ---- 股权术语 ----
  {
    vocabKey: 'equity_name',
    defaultValue: '道德股权',
    category: 'equity_term',
    description: '整个体系的名称，即"道德股权"这四个字本身',
    scope: 'global',
  },
  {
    vocabKey: 'equity_total',
    defaultValue: '股权总值',
    category: 'equity_term',
    description: '用户累积的股权总量显示名称',
    scope: 'global',
  },
  {
    vocabKey: 'equity_earned',
    defaultValue: '获得股权',
    category: 'equity_term',
    description: '完成一次任务后获得的股权量的显示名称',
    scope: 'global',
  },
  {
    vocabKey: 'equity_holdership',
    defaultValue: '持股权',
    category: 'equity_term',
    description: '用户在共同体中持有的道德股权比例的名称',
    scope: 'global',
  },

  // ---- 系统术语 ----
  {
    vocabKey: 'sys_leaderboard',
    defaultValue: '善行排行榜',
    category: 'system_term',
    description: '展示善行排名的排行榜名称',
    scope: 'global',
  },
  {
    vocabKey: 'sys_checkin',
    defaultValue: '打卡',
    category: 'system_term',
    description: '完成日常任务的动作名称',
    scope: 'global',
  },
  {
    vocabKey: 'sys_streak',
    defaultValue: '连续天数',
    category: 'system_term',
    description: '连续完成任务的天数统计名称',
    scope: 'global',
  },
  {
    vocabKey: 'sys_moral_ledger',
    defaultValue: '道德账本',
    category: 'system_term',
    description: '道德评分记录系统的名称',
    scope: 'global',
  },
  {
    vocabKey: 'sys_good_deed',
    defaultValue: '善行',
    category: 'system_term',
    description: '一切道德行为的通用称呼',
    scope: 'global',
  },
  {
    vocabKey: 'sys_dopamine',
    defaultValue: '多巴胺',
    category: 'system_term',
    description: '善行奖励的生物学隐喻名称',
    scope: 'global',
  },
  {
    vocabKey: 'sys_new_scale_tilt',
    defaultValue: '新天枰倾斜',
    category: 'system_term',
    description: '健全人→残疾人、城市→农村、富裕→贫困的倾斜分配原则',
    scope: 'global',
  },
]

// ============================================
// 等级/品阶阈值配置
// ============================================

export interface LevelConfig {
  level: number
  minEquity: number
  name: string   // 默认名称，实际显示应查词汇表
  tier: string   // 默认品阶，实际显示应查词汇表
  icon: string
  color: string
  benefits: string[]
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    minEquity: 0,
    name: '初善',
    tier: '德者',
    icon: '🌱',
    color: '#10b981',
    benefits: ['基础任务解锁', '善行记录查看'],
  },
  {
    level: 2,
    minEquity: 100,
    name: '进善',
    tier: '善者',
    icon: '🌿',
    color: '#3b82f6',
    benefits: ['中等任务解锁', '排行榜显示', '道德雷达图'],
  },
  {
    level: 3,
    minEquity: 500,
    name: '明善',
    tier: '仁者',
    icon: '🌳',
    color: '#8b5cf6',
    benefits: ['困难任务解锁', '项目优先审核', '共同体投票权'],
  },
  {
    level: 4,
    minEquity: 2000,
    name: '高善',
    tier: '义者',
    icon: '🏔️',
    color: '#f97316',
    benefits: ['传奇任务解锁', '项目发起权', '评审资格', '专属标识'],
  },
  {
    level: 5,
    minEquity: 10000,
    name: '至善',
    tier: '圣者',
    icon: '⭐',
    color: '#eab308',
    benefits: ['全部权限', '导师资格', '体系建议权', '终身荣誉'],
  },
]

// ============================================
// 词汇工具函数
// ============================================

/**
 * 获取词汇的当前显示值
 * 如果有自定义值则返回自定义值，否则返回默认值
 */
export function getVocabDisplay(entry: {
  defaultValue: string
  customValue: string | null
  isCustomized: boolean
}): string {
  if (entry.isCustomized && entry.customValue) {
    return entry.customValue
  }
  return entry.defaultValue
}

/**
 * 根据道德股权值计算等级
 */
export function calculateLevel(totalEquity: number): LevelConfig {
  let result = LEVEL_CONFIGS[0]
  for (const config of LEVEL_CONFIGS) {
    if (totalEquity >= config.minEquity) {
      result = config
    } else {
      break
    }
  }
  return result
}

/**
 * 获取等级进度百分比
 */
export function getLevelProgress(totalEquity: number): number {
  const current = calculateLevel(totalEquity)
  const nextLevel = LEVEL_CONFIGS.find(l => l.level === current.level + 1)

  if (!nextLevel) return 100 // 已满级

  const rangeStart = current.minEquity
  const rangeEnd = nextLevel.minEquity
  const progress = ((totalEquity - rangeStart) / (rangeEnd - rangeStart)) * 100
  return Math.min(100, Math.max(0, Math.round(progress)))
}

/**
 * 词汇导入文档格式校验
 * 支持的JSON格式：
 * {
 *   "version": "1.0",
 *   "description": "自定义词汇包描述",
 *   "vocabularies": [
 *     { "vocabKey": "value_unit", "customValue": "功德" },
 *     ...
 *   ]
 * }
 */
export interface VocabImportDoc {
  version: string
  description?: string
  author?: string
  vocabularies: Array<{
    vocabKey: string
    customValue: string
    category?: string
    description?: string
  }>
}

export function validateVocabImportDoc(doc: any): {
  valid: boolean
  errors: string[]
  data?: VocabImportDoc
} {
  const errors: string[] = []

  if (!doc || typeof doc !== 'object') {
    return { valid: false, errors: ['文档必须是一个JSON对象'] }
  }

  if (!doc.version || typeof doc.version !== 'string') {
    errors.push('文档必须包含version字段（字符串）')
  }

  if (!doc.vocabularies || !Array.isArray(doc.vocabularies)) {
    errors.push('文档必须包含vocabularies数组')
    return { valid: false, errors }
  }

  if (doc.vocabularies.length === 0) {
    errors.push('vocabularies数组不能为空')
  }

  if (doc.vocabularies.length > 500) {
    errors.push('单次导入词汇不能超过500条')
  }

  // 校验每条词汇
  const validKeys = new Set(DEFAULT_VOCABULARY.map(v => v.vocabKey))
  for (let i = 0; i < doc.vocabularies.length; i++) {
    const item = doc.vocabularies[i]
    if (!item.vocabKey || typeof item.vocabKey !== 'string') {
      errors.push(`第${i + 1}条词汇缺少vocabKey`)
      continue
    }
    if (!item.customValue || typeof item.customValue !== 'string') {
      errors.push(`第${i + 1}条词汇缺少customValue`)
      continue
    }
    if (item.customValue.length > 20) {
      errors.push(`第${i + 1}条词汇customValue长度不能超过20字符`)
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    data: doc as VocabImportDoc,
  }
}

/**
 * 生成词汇导出文档
 */
export function generateVocabExportDoc(
  vocabularies: Array<{
    vocabKey: string
    defaultValue: string
    customValue: string | null
    category: string
    description: string
    isCustomized: boolean
  }>
): VocabImportDoc {
  return {
    version: '1.0',
    description: `圆聚助残平台词汇导出 — ${new Date().toISOString().split('T')[0]}`,
    vocabularies: vocabularies.map(v => ({
      vocabKey: v.vocabKey,
      customValue: v.isCustomized && v.customValue ? v.customValue : v.defaultValue,
      category: v.category,
      description: v.description,
    })),
  }
}
