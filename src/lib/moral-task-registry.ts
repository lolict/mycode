/**
 * 道德股权 · 任务注册表
 * Moral Equity — Task Registry
 *
 * 定义系统中所有可用的道德任务
 * 任务分类：daily（日常）/ weekly（周常）/ monthly（月度）/ one-time（一次性）/ special（专项）
 * 每个任务关联德系模块，完成任务触发多巴胺+股权增长
 */

// ============================================
// 任务分类配置
// ============================================

export interface TaskCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  resetCycle: string  // 重置周期
}

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'daily',
    name: '日常任务',
    description: '每天重置，鼓励用户每天参与善行。日常任务是道德股权体系最基础的增长来源，通过持续的小善行累积可观的道德值。连续完成日常任务还能获得连击加成。',
    icon: 'Sun',
    color: '#f59e0b',
    resetCycle: '每日0:00重置',
  },
  {
    id: 'weekly',
    name: '周常任务',
    description: '每周重置，需要更多投入但回报更丰厚。周常任务通常涉及更深度的善行参与，适合有一定积累的用户挑战。',
    icon: 'Calendar',
    color: '#3b82f6',
    resetCycle: '每周一0:00重置',
  },
  {
    id: 'monthly',
    name: '月度任务',
    description: '每月重置的大型任务，通常需要持续投入或团队协作。月度任务是检验道德坚持的重要标尺。',
    icon: 'CalendarDays',
    color: '#8b5cf6',
    resetCycle: '每月1日0:00重置',
  },
  {
    id: 'one-time',
    name: '一次性任务',
    description: '仅可完成一次的特别任务，通常是入门引导或里程碑成就。一次性任务帮助新用户快速了解体系。',
    icon: 'Star',
    color: '#10b981',
    resetCycle: '永不重置',
  },
  {
    id: 'special',
    name: '专项任务',
    description: '特定场景下的限时任务，如灾害救援响应、特殊节日活动等。专项任务通常具有较高的道德值和特殊的五维加成。',
    icon: 'Flame',
    color: '#ef4444',
    resetCycle: '限时',
  },
]

// ============================================
// 难度配置
// ============================================

export interface DifficultyConfig {
  id: string
  name: string
  multiplier: number  // 道德值倍率
  icon: string
  color: string
}

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  { id: 'easy', name: '简单', multiplier: 1.0, icon: 'Leaf', color: '#10b981' },
  { id: 'medium', name: '普通', multiplier: 1.5, icon: 'TreePine', color: '#3b82f6' },
  { id: 'hard', name: '困难', multiplier: 2.5, icon: 'Mountain', color: '#f97316' },
  { id: 'legendary', name: '传奇', multiplier: 4.0, icon: 'Crown', color: '#eab308' },
]

// ============================================
// 道德任务定义
// ============================================

export interface MoralTaskDef {
  code: string
  name: string
  description: string
  category: string       // daily/weekly/monthly/one-time/special
  moralValue: number     // 基础道德值
  difficulty: string     // easy/medium/hard/legendary
  icon: string
  color: string
  conditions?: string    // JSON完成条件
  rewards?: string       // JSON奖励
  linkedModule?: string  // 关联的德系模块code
  sortOrder: number
}

export const MORAL_TASKS: MoralTaskDef[] = [
  // ==========================================
  // 日常任务 — 每天可做，积少成多
  // ==========================================
  {
    code: 'daily_checkin',
    name: '每日签到',
    description: '每天登录平台签到，表示对助残事业持续关注。连续签到的天数越多，额外奖励越高——善行贵在坚持，每日的微小关注也是对残健共同体的支持。',
    category: 'daily',
    moralValue: 5,
    difficulty: 'easy',
    icon: 'CheckCircle',
    color: '#10b981',
    conditions: JSON.stringify({ type: 'login', description: '当日首次登录' }),
    rewards: JSON.stringify({ base: 5, streak_bonus: '1% per day, max 50%' }),
    sortOrder: 1,
  },
  {
    code: 'daily_share',
    name: '传播善声',
    description: '每日分享一个助残项目或善行故事到社交平台。传播本身就是善行——让更多人看到残疾人的需求，就可能引发更多的帮助。您的每一次分享，都是一座桥。',
    category: 'daily',
    moralValue: 8,
    difficulty: 'easy',
    icon: 'Share2',
    color: '#3b82f6',
    linkedModule: 'dechuan',
    conditions: JSON.stringify({ type: 'share', description: '分享任一项目到社交平台' }),
    sortOrder: 2,
  },
  {
    code: 'daily_comment',
    name: '善言鼓励',
    description: '每日对一个助残项目发表建设性评论。善言可以温暖人心，您的一句鼓励可能就是某个残疾人坚持下去的动力。评论需要真诚有内容，空泛灌水不计入。',
    category: 'daily',
    moralValue: 6,
    difficulty: 'easy',
    icon: 'MessageCircle',
    color: '#8b5cf6',
    conditions: JSON.stringify({ type: 'comment', minLength: 10, description: '发表10字以上的建设性评论' }),
    sortOrder: 3,
  },
  {
    code: 'daily_learn',
    name: '每日学善',
    description: '每日阅读一篇助残相关文章或学习一个无障碍知识。知善才能行善，了解残疾人的真实处境和需求，是有效帮助的第一步。知识转化为行动力，就是道德的力量。',
    category: 'daily',
    moralValue: 6,
    difficulty: 'easy',
    icon: 'BookOpen',
    color: '#6366f1',
    linkedModule: 'deshu',
    conditions: JSON.stringify({ type: 'read', duration: 30, description: '阅读30秒以上的文章' }),
    sortOrder: 4,
  },
  {
    code: 'daily_verify',
    name: '火眼金睛',
    description: '每日验证一个项目信息的真实性。真实性是公益的根基，您的每一次验证都是在守护整个共同体的信任底线。这是正义维度得分最高的日常任务。',
    category: 'daily',
    moralValue: 10,
    difficulty: 'medium',
    icon: 'Shield',
    color: '#ec4899',
    linkedModule: 'dejiancha',
    conditions: JSON.stringify({ type: 'verify', description: '验证一个项目的至少一项信息' }),
    sortOrder: 5,
  },
  {
    code: 'daily_help',
    name: '举手之劳',
    description: '每日完成一次互助行为，哪怕是最小的帮助也算。帮残疾人推一次门、指一次路、递一次东西——举手之劳对健全人来说是本能，对残疾人来说可能就是雪中送炭。',
    category: 'daily',
    moralValue: 12,
    difficulty: 'medium',
    icon: 'HandHelping',
    color: '#f97316',
    linkedModule: 'defu2',
    conditions: JSON.stringify({ type: 'help', description: '记录一次互助行为' }),
    sortOrder: 6,
  },

  // ==========================================
  // 周常任务 — 每周挑战，深度参与
  // ==========================================
  {
    code: 'weekly_donate',
    name: '周行一善',
    description: '每周向一个助残项目捐款，金额不限。重要的不是多少，而是坚持。每周一次的捐助习惯，长期累积将产生巨大的社会影响。这也是对自我道德坚持的考验。',
    category: 'weekly',
    moralValue: 30,
    difficulty: 'medium',
    icon: 'Heart',
    color: '#ef4444',
    linkedModule: 'dejuan',
    conditions: JSON.stringify({ type: 'donate', minAmount: 1, description: '向任意项目捐款≥1元' }),
    rewards: JSON.stringify({ base: 30, bonus_kindness: 10 }),
    sortOrder: 10,
  },
  {
    code: 'weekly_volunteer',
    name: '志愿时光',
    description: '每周参与至少1小时的志愿服务。志愿服务是奉献维度得分最高的行为类型，您的时间比金钱更宝贵——因为时间是每个人都有限的资源，愿意付出时间就是最大的诚意。',
    category: 'weekly',
    moralValue: 40,
    difficulty: 'medium',
    icon: 'Clock',
    color: '#14b8a6',
    linkedModule: 'defang',
    conditions: JSON.stringify({ type: 'volunteer', minHours: 1, description: '志愿服务≥1小时' }),
    rewards: JSON.stringify({ base: 40, bonus_dedication: 15 }),
    sortOrder: 11,
  },
  {
    code: 'weekly_visit',
    name: '温情家访',
    description: '每周对一位残疾人进行家访或线上关怀。家访能够最直接地了解残疾人的真实需求，恻隐之心由此而生。看到真实的困境，才能产生真实的善意，而非居高临下的同情。',
    category: 'weekly',
    moralValue: 35,
    difficulty: 'medium',
    icon: 'Home',
    color: '#a855f7',
    linkedModule: 'defang',
    conditions: JSON.stringify({ type: 'visit', description: '完成一次家访或线上关怀' }),
    rewards: JSON.stringify({ base: 35, bonus_compassion: 15 }),
    sortOrder: 12,
  },
  {
    code: 'weekly_teach',
    name: '传道授业',
    description: '每周为残疾人提供一次技能教学或知识分享。授人以鱼不如授人以渔，教会一个技能可以让残疾人自立自强，这是善行的最高形式——让对方不再需要帮助。',
    category: 'weekly',
    moralValue: 45,
    difficulty: 'hard',
    icon: 'GraduationCap',
    color: '#0ea5e9',
    linkedModule: 'dejiao',
    conditions: JSON.stringify({ type: 'teach', duration: 30, description: '教学≥30分钟' }),
    rewards: JSON.stringify({ base: 45, bonus_justice: 10, bonus_dedication: 10 }),
    sortOrder: 13,
  },

  // ==========================================
  // 月度任务 — 深度投入
  // ==========================================
  {
    code: 'monthly_create_project',
    name: '发起善举',
    description: '每月发起一个助残项目。发起项目需要深入了解需求、组织资源、持续跟进，是综合道德素养的体现。一个成功的项目可以改变许多人的生活，发起者的功德无可估量。',
    category: 'monthly',
    moralValue: 80,
    difficulty: 'hard',
    icon: 'Rocket',
    color: '#7c3aed',
    linkedModule: 'dechuang',
    conditions: JSON.stringify({ type: 'create_project', description: '创建一个合规的助残项目' }),
    rewards: JSON.stringify({ base: 80, bonus_all_dimensions: 5 }),
    sortOrder: 20,
  },
  {
    code: 'monthly_supervise',
    name: '正义监察',
    description: '每月参与项目审核和监督工作，确保每一分善款都用在刀刃上。监督是正义的守护，没有人监督的善行容易腐化。这是对正义维度贡献最大的任务类型。',
    category: 'monthly',
    moralValue: 60,
    difficulty: 'hard',
    icon: 'Scale',
    color: '#1d4ed8',
    linkedModule: 'dedu',
    conditions: JSON.stringify({ type: 'supervise', count: 3, description: '审核或监督≥3个项目' }),
    rewards: JSON.stringify({ base: 60, bonus_justice: 20 }),
    sortOrder: 21,
  },
  {
    code: 'monthly_innovation',
    name: '善创计划',
    description: '每月提出一个助残创新方案。创新是推动社会进步的核心动力，为残疾人群体设计新的解决方案需要深刻的共情和非凡的创造力。最好的创新来源于最深的关怀。',
    category: 'monthly',
    moralValue: 70,
    difficulty: 'hard',
    icon: 'Lightbulb',
    color: '#f59e0b',
    linkedModule: 'dechuang',
    conditions: JSON.stringify({ type: 'innovation', description: '提交一个创新方案文档' }),
    rewards: JSON.stringify({ base: 70, bonus_kindness: 10, bonus_compassion: 10 }),
    sortOrder: 22,
  },

  // ==========================================
  // 一次性任务 — 入门与里程碑
  // ==========================================
  {
    code: 'onboard_register',
    name: '善途启程',
    description: '完成平台注册并完善个人资料。千里之行始于足下，注册本身就是加入残健共同体的第一步。完善资料让平台能更好地匹配您的善行能力与残疾人的需求。',
    category: 'one-time',
    moralValue: 20,
    difficulty: 'easy',
    icon: 'UserPlus',
    color: '#10b981',
    conditions: JSON.stringify({ type: 'register', description: '完成注册并填写基本信息' }),
    sortOrder: 30,
  },
  {
    code: 'onboard_first_donate',
    name: '初次布施',
    description: '完成人生中在平台的第一次捐款。第一次的意义远超金额本身——它标志着您从关注者变为参与者，从旁观者变为行动者。这一步，值得铭记。',
    category: 'one-time',
    moralValue: 50,
    difficulty: 'medium',
    icon: 'Gift',
    color: '#ef4444',
    linkedModule: 'dejuan',
    conditions: JSON.stringify({ type: 'donate', count: 1, description: '完成首次捐款' }),
    rewards: JSON.stringify({ base: 50, bonus_kindness: 15 }),
    sortOrder: 31,
  },
  {
    code: 'onboard_first_volunteer',
    name: '初行志愿',
    description: '完成首次志愿服务。志愿服务与捐款不同，它需要您亲自到场、亲身参与。第一次志愿服务往往是最难忘的——因为您将第一次亲眼看到，您的帮助如何改变了一个人的生活。',
    category: 'one-time',
    moralValue: 60,
    difficulty: 'medium',
    icon: 'HandHeart',
    color: '#8b5cf6',
    linkedModule: 'defang',
    conditions: JSON.stringify({ type: 'volunteer', count: 1, description: '完成首次志愿服务' }),
    rewards: JSON.stringify({ base: 60, bonus_dedication: 15 }),
    sortOrder: 32,
  },
  {
    code: 'milestone_100_tasks',
    name: '百善之师',
    description: '累计完成100个道德任务。一百次善行不是终点，而是新的起点——到了这个里程碑，您已经是共同体的中坚力量，您的行为正在影响和带动更多人加入。',
    category: 'one-time',
    moralValue: 200,
    difficulty: 'legendary',
    icon: 'Trophy',
    color: '#eab308',
    conditions: JSON.stringify({ type: 'total_tasks', count: 100, description: '累计完成100个任务' }),
    rewards: JSON.stringify({ base: 200, title: '百善之师' }),
    sortOrder: 40,
  },

  // ==========================================
  // 专项任务 — 特殊场景
  // ==========================================
  {
    code: 'emergency_response',
    name: '紧急响应',
    description: '在灾害或突发事件中参与紧急援助。紧急情况下的善行价值最高——因为时间就是生命，能在危急时刻挺身而出的人，其道德品质经受了最严峻的考验。',
    category: 'special',
    moralValue: 100,
    difficulty: 'legendary',
    icon: 'Siren',
    color: '#dc2626',
    linkedModule: 'deji',
    conditions: JSON.stringify({ type: 'emergency', description: '参与紧急救援响应' }),
    rewards: JSON.stringify({ base: 100, bonus_severity: 30, bonus_compassion: 20 }),
    sortOrder: 50,
  },
  {
    code: 'accessibility_audit',
    name: '无障碍审查',
    description: '参与公共场所或线上平台的无障碍审查工作。无障碍环境是残疾人平等参与社会的基础，发现一个障碍就是帮到所有遇到这个障碍的人。这是正义维度的最高体现。',
    category: 'special',
    moralValue: 50,
    difficulty: 'hard',
    icon: 'Eye',
    color: '#0891b2',
    linkedModule: 'dejianji',
    conditions: JSON.stringify({ type: 'audit', description: '提交无障碍审查报告' }),
    rewards: JSON.stringify({ base: 50, bonus_justice: 25 }),
    sortOrder: 51,
  },
  {
    code: 'mentor_program',
    name: '善行导师',
    description: '成为新人的善行导师，指导至少3位新人完成他们的首次善行。传承善行比独自善行更有价值——教会别人行善，善行就会像涟漪一样扩散开来，影响远超个人。',
    category: 'special',
    moralValue: 80,
    difficulty: 'hard',
    icon: 'Users',
    color: '#7c3aed',
    conditions: JSON.stringify({ type: 'mentor', mentees: 3, description: '指导≥3位新人完成首次善行' }),
    rewards: JSON.stringify({ base: 80, bonus_all_dimensions: 8 }),
    sortOrder: 52,
  },
]

// ============================================
// 任务工具函数
// ============================================

export function getTaskByCode(code: string): MoralTaskDef | undefined {
  return MORAL_TASKS.find(t => t.code === code)
}

export function getTasksByCategory(category: string): MoralTaskDef[] {
  return MORAL_TASKS.filter(t => t.category === category)
}

export function getTasksByDifficulty(difficulty: string): MoralTaskDef[] {
  return MORAL_TASKS.filter(t => t.difficulty === difficulty)
}

export function getTaskStats() {
  return {
    total: MORAL_TASKS.length,
    byCategory: TASK_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      count: MORAL_TASKS.filter(t => t.category === c.id).length,
    })),
    byDifficulty: DIFFICULTY_CONFIGS.map(d => ({
      id: d.id,
      name: d.name,
      count: MORAL_TASKS.filter(t => t.difficulty === d.id).length,
    })),
    totalDailyValue: MORAL_TASKS.filter(t => t.category === 'daily').reduce((s, t) => s + t.moralValue, 0),
    totalWeeklyValue: MORAL_TASKS.filter(t => t.category === 'weekly').reduce((s, t) => s + t.moralValue, 0),
  }
}
