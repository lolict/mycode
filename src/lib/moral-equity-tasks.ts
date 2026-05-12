// ============================================
// 道德股权任务定义 (Moral Equity Tasks)
// 圆聚助残公益众筹平台 - 22个道德任务
// ============================================

export type VirtueCategory = 'benevolence' | 'righteousness' | 'propriety' | 'wisdom' | 'trust'
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'once' | 'special'

export interface MoralTaskDef {
  code: string
  name: string
  description: string
  virtue: VirtueCategory
  frequency: TaskFrequency
  points: number
  targetCount: number
}

export const VIRTUE_LABELS: Record<VirtueCategory, { name: string; icon: string; color: string; description: string }> = {
  benevolence:    { name: '仁', icon: '❤️', color: '#EF4444', description: '关爱助人，慈悲为怀' },
  righteousness:  { name: '义', icon: '⚖️', color: '#3B82F6', description: '公正守信，见义勇为' },
  propriety:      { name: '礼', icon: '🙏', color: '#10B981', description: '尊重有序，以礼待人' },
  wisdom:         { name: '智', icon: '💡', color: '#F59E0B', description: '明辨是非，明智抉择' },
  trust:          { name: '信', icon: '🤝', color: '#8B5CF6', description: '诚实可靠，言而有信' },
}

export const FREQUENCY_LABELS: Record<TaskFrequency, { name: string; color: string }> = {
  daily:   { name: '日常任务', color: '#10B981' },
  weekly:  { name: '周常任务', color: '#3B82F6' },
  monthly: { name: '月度任务', color: '#F59E0B' },
  once:    { name: '一次性任务', color: '#8B5CF6' },
  special: { name: '专项任务', color: '#EF4444' },
}

// 22个道德任务
export const MORAL_TASKS: MoralTaskDef[] = [
  // === 仁 (关爱助人) - 5个 ===
  { code: 'MORAL-BENE-001', name: '每日一善', description: '每天完成一件善事，帮助他人或参与公益活动', virtue: 'benevolence', frequency: 'daily', points: 5, targetCount: 1 },
  { code: 'MORAL-BENE-002', name: '助残服务', description: '为残障人士提供实际帮助，如导盲、推轮椅等', virtue: 'benevolence', frequency: 'daily', points: 10, targetCount: 1 },
  { code: 'MORAL-BENE-003', name: '关爱探访', description: '定期探访独居残障人士，给予精神关怀和实际帮助', virtue: 'benevolence', frequency: 'weekly', points: 20, targetCount: 1 },
  { code: 'MORAL-BENE-004', name: '捐赠善款', description: '向公益项目捐赠善款，帮助有需要的人', virtue: 'benevolence', frequency: 'monthly', points: 30, targetCount: 1 },
  { code: 'MORAL-BENE-005', name: '紧急救助', description: '参与紧急救助行动，响应突发事件援助需求', virtue: 'benevolence', frequency: 'special', points: 50, targetCount: 1 },

  // === 义 (公正守信) - 4个 ===
  { code: 'MORAL-RIGH-001', name: '诚信报告', description: '如实报告项目进展和资金使用情况，做到信息透明', virtue: 'righteousness', frequency: 'daily', points: 5, targetCount: 1 },
  { code: 'MORAL-RIGH-002', name: '公正评价', description: '客观公正地评价项目和服务，不偏不倚', virtue: 'righteousness', frequency: 'weekly', points: 15, targetCount: 1 },
  { code: 'MORAL-RIGH-003', name: '维权行动', description: '为残障人士维护合法权益，反对不公正待遇', virtue: 'righteousness', frequency: 'monthly', points: 25, targetCount: 1 },
  { code: 'MORAL-RIGH-004', name: '合规经营', description: '确保平台运营合规合法，接受社会监督', virtue: 'righteousness', frequency: 'once', points: 40, targetCount: 1 },

  // === 礼 (尊重有序) - 4个 ===
  { code: 'MORAL-PROP-001', name: '礼仪互动', description: '在社区中以礼待人，尊重每位成员', virtue: 'propriety', frequency: 'daily', points: 3, targetCount: 3 },
  { code: 'MORAL-PROP-002', name: '无障碍倡导', description: '宣传和推广无障碍理念，促进社会包容', virtue: 'propriety', frequency: 'weekly', points: 15, targetCount: 1 },
  { code: 'MORAL-PROP-003', name: '文明议事', description: '在社区讨论中理性发言，尊重不同观点', virtue: 'propriety', frequency: 'monthly', points: 20, targetCount: 1 },
  { code: 'MORAL-PROP-004', name: '志愿礼仪', description: '完成志愿者礼仪培训，提升服务质量', virtue: 'propriety', frequency: 'once', points: 35, targetCount: 1 },

  // === 智 (明辨是非) - 5个 ===
  { code: 'MORAL-WISD-001', name: '每日学习', description: '每天学习残障相关知识和助人技能', virtue: 'wisdom', frequency: 'daily', points: 5, targetCount: 1 },
  { code: 'MORAL-WISD-002', name: '知识分享', description: '将学到的知识和经验分享给社区成员', virtue: 'wisdom', frequency: 'weekly', points: 15, targetCount: 1 },
  { code: 'MORAL-WISD-003', name: '项目评估', description: '对众筹项目进行专业评估，帮助识别风险', virtue: 'wisdom', frequency: 'monthly', points: 25, targetCount: 1 },
  { code: 'MORAL-WISD-004', name: '技能培训', description: '完成助残相关技能培训并获得认证', virtue: 'wisdom', frequency: 'once', points: 40, targetCount: 1 },
  { code: 'MORAL-WISD-005', name: '创新方案', description: '提出创新的助残方案或改善建议', virtue: 'wisdom', frequency: 'special', points: 50, targetCount: 1 },

  // === 信 (诚实可靠) - 4个 ===
  { code: 'MORAL-TRUST-001', name: '守信履约', description: '按时完成承诺的任务和义务，言出必行', virtue: 'trust', frequency: 'daily', points: 5, targetCount: 1 },
  { code: 'MORAL-TRUST-002', name: '真实反馈', description: '提供真实的使用反馈和评价，不弄虚作假', virtue: 'trust', frequency: 'weekly', points: 10, targetCount: 1 },
  { code: 'MORAL-TRUST-003', name: '信用积累', description: '持续保持良好信用记录，成为可信赖的社区成员', virtue: 'trust', frequency: 'monthly', points: 20, targetCount: 1 },
  { code: 'MORAL-TRUST-004', name: '信任担保', description: '为新加入的项目或成员提供信任担保', virtue: 'trust', frequency: 'special', points: 45, targetCount: 1 },
]

// 按德目分组
export function getTasksByVirtue(): Record<VirtueCategory, MoralTaskDef[]> {
  const result = {} as Record<VirtueCategory, MoralTaskDef[]>
  for (const v of Object.keys(VIRTUE_LABELS) as VirtueCategory[]) {
    result[v] = MORAL_TASKS.filter(t => t.virtue === v)
  }
  return result
}

// 按频率分组
export function getTasksByFrequency(): Record<TaskFrequency, MoralTaskDef[]> {
  const result = {} as Record<TaskFrequency, MoralTaskDef[]>
  for (const f of Object.keys(FREQUENCY_LABELS) as TaskFrequency[]) {
    result[f] = MORAL_TASKS.filter(t => t.frequency === f)
  }
  return result
}

// 道德等级计算
export function calculateEquityLevel(totalScore: number): string {
  if (totalScore >= 1000) return 'saint'     // 圣人
  if (totalScore >= 500) return 'sage'       // 贤人
  if (totalScore >= 200) return 'scholar'    // 君子
  return 'citizen'                            // 公民
}
