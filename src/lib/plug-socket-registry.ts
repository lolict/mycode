/**
 * 插板系统 — Unified Plug-Socket Board Registry
 *
 * 一切资源都是插头/插槽，型号匹配才能插入
 *
 * 物理比喻：
 * - 插头型号 = 国标两孔/三孔/USB-C/航空插头 → vocab/ui/data/action/signal/style/config
 * - 插槽型号 = 对应的插座面板 → vocab_display/ui_render/data_input/...
 * - 兼容规则 = 转接头（两孔插头能插三孔插座吗？需要转接吗？）
 * - 插头实例 = 一个具体的插头（"德值"这个词就是一个词汇插头）
 * - 插槽实例 = 一个具体的插座（"道德股权页面上显示计量单位的那个位置"就是词汇插槽）
 * - 连接 = 插头插入插槽，信号通过神经系统流通
 *
 * 神经系统整合：
 * - 插头插入插槽 → 神经信号 channel: 'plug:connected'
 * - 插头拔出插槽 → 神经信号 channel: 'plug:disconnected'
 * - 插头值变化 → 神经信号 channel: 'plug:updated'
 * - 插槽查询当前值 → 神经信号 channel: 'socket:query'
 *
 * 统一架构说明：
 * - 本文件提供7种插头型号、7种插槽型号、11条兼容规则
 * - 默认17个插头实例、9个插槽实例、9个默认连接
 * - 与 plugboard.ts 的 PlugBoardRegistry 完全集成
 */

// ============================================
// 插头型号定义 — 7种插头型号
// ============================================

export interface PlugTypeDef {
  code: string
  name: string
  description: string
  pinCount: number
  pinDefs: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'function' | 'component'
    required: boolean
    description: string
  }>
  icon: string
  color: string
}

export const PLUG_TYPES: PlugTypeDef[] = [
  {
    code: 'vocab',
    name: '词汇插头',
    description: '提供一个文字值，如"德值"→"功德"、"道德股权"→"德股"。词汇插头是最基础的插头类型，它决定了用户在界面上看到的所有文字术语。每个词汇插头携带一个string类型的值引脚，插入词汇插槽后，插槽所在位置就显示这个值。',
    pinCount: 1,
    pinDefs: [
      { name: 'value', type: 'string', required: true, description: '词汇的当前显示值' },
    ],
    icon: 'Type',
    color: '#eab308',
  },
  {
    code: 'ui',
    name: 'UI插头',
    description: '提供一个UI组件标识，如五维雷达图组件、进度条组件、卡片组件。UI插头使得界面完全可插拔——同一个插槽可以插入不同的UI插头来改变呈现方式。比如道德评分的展示，可以插入"雷达图插头"也可以插入"进度条插头"。',
    pinCount: 2,
    pinDefs: [
      { name: 'componentId', type: 'string', required: true, description: '组件标识（注册的组件名）' },
      { name: 'props', type: 'object', required: false, description: '组件属性配置' },
    ],
    icon: 'Layout',
    color: '#8b5cf6',
  },
  {
    code: 'data',
    name: '数据插头',
    description: '提供一组结构化数据，如道德股权统计数据、任务完成记录、排行榜数据。数据插头使得数据来源可替换——同一个排行榜插槽，可以插入"本地数据插头"也可以插入"云端数据插头"。',
    pinCount: 2,
    pinDefs: [
      { name: 'data', type: 'object', required: true, description: '数据内容（JSON结构）' },
      { name: 'schema', type: 'object', required: false, description: '数据结构描述' },
    ],
    icon: 'Database',
    color: '#3b82f6',
  },
  {
    code: 'action',
    name: '行为插头',
    description: '提供一个可执行动作，如"完成道德任务"、"导出词汇"、"重置数据"。行为插头使得操作可替换——同一个"签到按钮"插槽，可以插入"简单签到插头"也可以插入"带连击加成的签到插头"。',
    pinCount: 2,
    pinDefs: [
      { name: 'handler', type: 'function', required: true, description: '执行函数标识' },
      { name: 'params', type: 'object', required: false, description: '执行参数' },
    ],
    icon: 'Zap',
    color: '#f97316',
  },
  {
    code: 'signal',
    name: '信号插头',
    description: '提供一个信号处理能力，如"监听捐款事件并触发多巴胺"、"监听任务完成并更新股权"。信号插头是神经系统的基础单元，它定义了模块如何对信号做出响应。',
    pinCount: 3,
    pinDefs: [
      { name: 'channels', type: 'object', required: true, description: '订阅的信号频道列表' },
      { name: 'handler', type: 'function', required: true, description: '信号处理函数标识' },
      { name: 'priority', type: 'number', required: false, description: '处理优先级' },
    ],
    icon: 'Radio',
    color: '#10b981',
  },
  {
    code: 'style',
    name: '样式插头',
    description: '提供CSS/主题配置，如"暖色系主题"、"大字体模式"、"高对比度模式"。样式插头使得界面风格完全可定制，同一个页面插入不同样式插头就能获得完全不同的视觉体验。',
    pinCount: 2,
    pinDefs: [
      { name: 'theme', type: 'object', required: true, description: '主题配置对象' },
      { name: 'overrides', type: 'object', required: false, description: '局部样式覆盖' },
    ],
    icon: 'Palette',
    color: '#ec4899',
  },
  {
    code: 'config',
    name: '配置插头',
    description: '提供配置参数，如"五维评分权重配置"、"等级阈值配置"、"任务刷新周期"。配置插头使得系统行为可调——不需要改代码，只需插入不同配置插头就能改变系统参数。',
    pinCount: 2,
    pinDefs: [
      { name: 'config', type: 'object', required: true, description: '配置参数对象' },
      { name: 'version', type: 'string', required: false, description: '配置版本号' },
    ],
    icon: 'Settings',
    color: '#64748b',
  },
]

// ============================================
// 插槽型号定义 — 7种插槽型号
// ============================================

export interface SocketTypeDef {
  code: string
  name: string
  description: string
  pinCount: number
  pinDefs: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'function' | 'component'
    required: boolean
    description: string
  }>
  icon: string
  color: string
}

export const SOCKET_TYPES: SocketTypeDef[] = [
  {
    code: 'vocab_display',
    name: '词汇插槽',
    description: '需要接收一个文字值来显示。这是最常见的插槽类型，页面上每个显示术语的位置都是一个词汇插槽。当词汇插头插入后，该位置就显示插头携带的文字值。没有插头时显示默认值。',
    pinCount: 1,
    pinDefs: [
      { name: 'displayText', type: 'string', required: true, description: '要显示的文字' },
    ],
    icon: 'Type',
    color: '#eab308',
  },
  {
    code: 'ui_render',
    name: 'UI插槽',
    description: '需要接收一个UI组件来渲染。页面上的每个可变区域都是UI插槽，如道德评分展示区、排行榜区域、任务列表区域。插入不同的UI插头就能改变这些区域的呈现方式。',
    pinCount: 2,
    pinDefs: [
      { name: 'componentId', type: 'string', required: true, description: '需要渲染的组件标识' },
      { name: 'props', type: 'object', required: false, description: '组件属性' },
    ],
    icon: 'Layout',
    color: '#8b5cf6',
  },
  {
    code: 'data_input',
    name: '数据插槽',
    description: '需要接收数据来处理。数据驱动的组件都有数据插槽，如排行榜需要排名数据、统计卡片需要汇总数据。插入不同的数据插头就能改变数据来源（本地/云端/缓存）。',
    pinCount: 2,
    pinDefs: [
      { name: 'data', type: 'object', required: true, description: '需要的数据' },
      { name: 'schema', type: 'object', required: false, description: '期望的数据结构' },
    ],
    icon: 'Database',
    color: '#3b82f6',
  },
  {
    code: 'action_handler',
    name: '行为插槽',
    description: '需要接收一个动作来执行。每个可交互的按钮、表单提交都有一个行为插槽。插入不同的行为插头就能改变点击后的执行逻辑，如"签到"按钮可以执行不同的签到策略。',
    pinCount: 2,
    pinDefs: [
      { name: 'handler', type: 'function', required: true, description: '需要执行的动作' },
      { name: 'params', type: 'object', required: false, description: '执行参数' },
    ],
    icon: 'Zap',
    color: '#f97316',
  },
  {
    code: 'signal_channel',
    name: '信号插槽',
    description: '需要接收信号处理能力。神经系统中的每个接收节点都是信号插槽。插入不同的信号插头就能改变模块对信号的响应方式，实现真正的"可编程神经"。',
    pinCount: 3,
    pinDefs: [
      { name: 'channels', type: 'object', required: true, description: '信号频道' },
      { name: 'handler', type: 'function', required: true, description: '信号处理' },
      { name: 'priority', type: 'number', required: false, description: '优先级' },
    ],
    icon: 'Radio',
    color: '#10b981',
  },
  {
    code: 'style_apply',
    name: '样式插槽',
    description: '需要接收样式配置来应用。每个可主题化的区域都有样式插槽。插入不同的样式插头就能改变视觉风格，如无障碍模式插入"高对比度"样式插头。',
    pinCount: 2,
    pinDefs: [
      { name: 'theme', type: 'object', required: true, description: '主题配置' },
      { name: 'overrides', type: 'object', required: false, description: '局部覆盖' },
    ],
    icon: 'Palette',
    color: '#ec4899',
  },
  {
    code: 'config_read',
    name: '配置插槽',
    description: '需要接收配置参数来使用。系统的每个可配置点都有配置插槽。插入不同的配置插头就能改变系统行为，如五维权重、等级阈值、刷新周期等。',
    pinCount: 2,
    pinDefs: [
      { name: 'config', type: 'object', required: true, description: '配置参数' },
      { name: 'version', type: 'string', required: false, description: '配置版本' },
    ],
    icon: 'Settings',
    color: '#64748b',
  },
]

// ============================================
// 兼容规则 — 哪种插头能插哪种插槽
// ============================================

export interface CompatibleRuleDef {
  plugTypeCode: string
  socketTypeCode: string
  transform?: string  // JSON转换规则描述
  priority: number
  description: string
}

export const COMPATIBLE_RULES: CompatibleRuleDef[] = [
  // 直接匹配（同型号插头→插槽）
  {
    plugTypeCode: 'vocab',
    socketTypeCode: 'vocab_display',
    priority: 100,
    description: '词汇插头→词汇插槽：直接匹配，词汇值即为显示文本',
  },
  {
    plugTypeCode: 'ui',
    socketTypeCode: 'ui_render',
    priority: 100,
    description: 'UI插头→UI插槽：直接匹配，组件标识即为渲染目标',
  },
  {
    plugTypeCode: 'data',
    socketTypeCode: 'data_input',
    priority: 100,
    description: '数据插头→数据插槽：直接匹配，数据内容直接输入',
  },
  {
    plugTypeCode: 'action',
    socketTypeCode: 'action_handler',
    priority: 100,
    description: '行为插头→行为插槽：直接匹配，动作函数直接执行',
  },
  {
    plugTypeCode: 'signal',
    socketTypeCode: 'signal_channel',
    priority: 100,
    description: '信号插头→信号插槽：直接匹配，信号处理直接注册',
  },
  {
    plugTypeCode: 'style',
    socketTypeCode: 'style_apply',
    priority: 100,
    description: '样式插头→样式插槽：直接匹配，主题配置直接应用',
  },
  {
    plugTypeCode: 'config',
    socketTypeCode: 'config_read',
    priority: 100,
    description: '配置插头→配置插槽：直接匹配，配置参数直接读取',
  },

  // 跨型号兼容（需要转接）
  {
    plugTypeCode: 'vocab',
    socketTypeCode: 'config_read',
    transform: JSON.stringify({ method: 'parse_value', description: '词汇值可解析为配置值（如"30"→数字30）' }),
    priority: 10,
    description: '词汇插头→配置插槽：词汇值可以当作简单配置值使用，低优先级',
  },
  {
    plugTypeCode: 'config',
    socketTypeCode: 'data_input',
    transform: JSON.stringify({ method: 'wrap_as_data', description: '配置对象包装为数据对象' }),
    priority: 20,
    description: '配置插头→数据插槽：配置参数可以当作静态数据源',
  },
  {
    plugTypeCode: 'data',
    socketTypeCode: 'config_read',
    transform: JSON.stringify({ method: 'extract_config', description: '从数据中提取配置' }),
    priority: 20,
    description: '数据插头→配置插槽：数据中可包含配置信息',
  },
  {
    plugTypeCode: 'action',
    socketTypeCode: 'signal_channel',
    transform: JSON.stringify({ method: 'wrap_as_handler', description: '行为函数包装为信号处理器' }),
    priority: 30,
    description: '行为插头→信号插槽：行为函数可注册为信号处理器',
  },
]

// ============================================
// 默认插头实例 — 系统预装的插头
// ============================================

export interface PlugDef {
  code: string
  name: string
  description: string
  plugTypeCode: string
  provider: string
  pinValues: string  // JSON
  sourceModule?: string
}

export const DEFAULT_PLUGS: PlugDef[] = [
  // ---- 词汇插头（来自moral-vocabulary） ----
  {
    code: 'vocab_value_unit',
    name: '价值单位词汇',
    description: '道德价值的计量单位名称，默认"德值"，可自定义为"功德""善点"等',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '德值' }),
  },
  {
    code: 'vocab_equity_name',
    name: '股权名称词汇',
    description: '道德股权体系的名称，默认"道德股权"，可自定义为"德股""善权"等',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '道德股权' }),
  },
  {
    code: 'vocab_equity_total',
    name: '股权总值词汇',
    description: '用户累积的股权总量名称，默认"股权总值"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '股权总值' }),
  },
  {
    code: 'vocab_good_deed',
    name: '善行词汇',
    description: '一切道德行为的通用称呼，默认"善行"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '善行' }),
  },
  {
    code: 'vocab_checkin',
    name: '打卡词汇',
    description: '完成日常任务的动作名称，默认"打卡"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '打卡' }),
  },
  {
    code: 'vocab_streak',
    name: '连续天数词汇',
    description: '连续完成任务的天数统计名称，默认"连续天数"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '连续天数' }),
  },
  {
    code: 'vocab_dim_kindness',
    name: '善良维度词汇',
    description: '五维评分第一维名称，默认"善良"，可改为"仁心"等',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '善良' }),
  },
  {
    code: 'vocab_dim_compassion',
    name: '恻隐维度词汇',
    description: '五维评分第二维名称，默认"恻隐"，可改为"慈悲"等',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '恻隐' }),
  },
  {
    code: 'vocab_dim_justice',
    name: '正义维度词汇',
    description: '五维评分第三维名称，默认"正义"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '正义' }),
  },
  {
    code: 'vocab_dim_dedication',
    name: '奉献维度词汇',
    description: '五维评分第四维名称，默认"奉献"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '奉献' }),
  },
  {
    code: 'vocab_dim_severity',
    name: '严重度维度词汇',
    description: '五维评分第五维名称，默认"严重度"',
    plugTypeCode: 'vocab',
    provider: 'moral-vocabulary',
    pinValues: JSON.stringify({ value: '严重度' }),
  },

  // ---- UI插头 ----
  {
    code: 'ui_five_dim_radar',
    name: '五维雷达图组件',
    description: '道德五维评分的雷达图可视化组件，用SVG绘制五边形雷达图',
    plugTypeCode: 'ui',
    provider: 'dopamine',
    pinValues: JSON.stringify({ componentId: 'FiveDimensionRadar', props: { size: 240, levels: 5 } }),
  },
  {
    code: 'ui_progress_bar',
    name: '进度条组件',
    description: '通用进度条组件，用于显示等级进度、任务完成度等',
    plugTypeCode: 'ui',
    provider: 'core',
    pinValues: JSON.stringify({ componentId: 'Progress', props: { variant: 'default' } }),
  },
  {
    code: 'ui_stat_card',
    name: '统计卡片组件',
    description: '带图标和数字的统计概览卡片，用于仪表盘',
    plugTypeCode: 'ui',
    provider: 'core',
    pinValues: JSON.stringify({ componentId: 'StatCard', props: {} }),
  },

  // ---- 配置插头 ----
  {
    code: 'config_five_dim_weights',
    name: '五维权重配置',
    description: '道德五维评分的权重分配，默认善良30%恻隐25%正义20%奉献15%严重度10%',
    plugTypeCode: 'config',
    provider: 'dopamine',
    pinValues: JSON.stringify({
      config: { kindness: 0.30, compassion: 0.25, justice: 0.20, dedication: 0.15, severity: 0.10 },
      version: '1.0',
    }),
  },
  {
    code: 'config_level_thresholds',
    name: '等级阈值配置',
    description: '道德等级的股权阈值，默认Lv1=0, Lv2=100, Lv3=500, Lv4=2000, Lv5=10000',
    plugTypeCode: 'config',
    provider: 'moral-equity',
    pinValues: JSON.stringify({
      config: { levels: [0, 100, 500, 2000, 10000] },
      version: '1.0',
    }),
  },

  // ---- 信号插头 ----
  {
    code: 'signal_dopamine_listener',
    name: '多巴胺监听器',
    description: '监听善行信号并触发多巴胺分泌',
    plugTypeCode: 'signal',
    provider: 'dopamine',
    pinValues: JSON.stringify({
      channels: ['action:donate', 'action:create', 'action:help', 'action:share', 'action:volunteer'],
      handler: 'dopamine-engine',
      priority: 5,
    }),
  },

  // ---- 行为插头 ----
  {
    code: 'action_complete_task',
    name: '完成任务动作',
    description: '完成道德任务的动作处理器，触发股权增长+多巴胺分泌',
    plugTypeCode: 'action',
    provider: 'moral-equity',
    pinValues: JSON.stringify({
      handler: 'moral-equity/complete',
      params: { triggerDopamine: true, updateStreak: true },
    }),
  },
]

// ============================================
// 默认插槽实例 — 系统预装的插槽
// ============================================

export interface SocketDef {
  code: string
  name: string
  description: string
  socketTypeCode: string
  consumer: string
  location: string  // JSON
  isRequired: boolean
  allowMultiple: boolean
}

export const DEFAULT_SOCKETS: SocketDef[] = [
  // ---- 道德股权页面的词汇插槽 ----
  {
    code: 'display_value_unit',
    name: '价值单位显示位',
    description: '道德股权页面上显示价值单位名称的位置',
    socketTypeCode: 'vocab_display',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'EquityOverview', area: 'stats', slot: 'value-unit-label' }),
    isRequired: true,
    allowMultiple: false,
  },
  {
    code: 'display_equity_name',
    name: '股权名称显示位',
    description: '页面上显示"道德股权"这个体系名称的位置',
    socketTypeCode: 'vocab_display',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'Header', area: 'title', slot: 'equity-name' }),
    isRequired: true,
    allowMultiple: false,
  },
  {
    code: 'display_good_deed',
    name: '善行术语显示位',
    description: '页面上显示"善行"这个通用称呼的位置',
    socketTypeCode: 'vocab_display',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'TaskSection', area: 'label', slot: 'good-deed-label' }),
    isRequired: false,
    allowMultiple: false,
  },
  {
    code: 'display_streak',
    name: '连续天数显示位',
    description: '页面上显示"连续天数"的位置',
    socketTypeCode: 'vocab_display',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'StatsGrid', area: 'streak', slot: 'streak-label' }),
    isRequired: false,
    allowMultiple: false,
  },

  // ---- UI插槽 ----
  {
    code: 'render_moral_score',
    name: '道德评分渲染位',
    description: '道德评分展示区域，可插入雷达图或进度条等不同UI组件',
    socketTypeCode: 'ui_render',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'ScoreSection', area: 'main', slot: 'score-renderer' }),
    isRequired: false,
    allowMultiple: false,
  },
  {
    code: 'render_level_progress',
    name: '等级进度渲染位',
    description: '等级进度展示区域',
    socketTypeCode: 'ui_render',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity', component: 'LevelSection', area: 'progress', slot: 'level-renderer' }),
    isRequired: false,
    allowMultiple: false,
  },

  // ---- 信号插槽 ----
  {
    code: 'channel_action_handler',
    name: '善行信号处理位',
    description: '接收善行完成信号的处理插槽，由多巴胺系统监听',
    socketTypeCode: 'signal_channel',
    consumer: 'dopamine-engine',
    location: JSON.stringify({ page: 'global', component: 'NervousSystem', area: 'action', slot: 'action-channel' }),
    isRequired: false,
    allowMultiple: true,
  },

  // ---- 配置插槽 ----
  {
    code: 'read_dim_weights',
    name: '五维权重读取位',
    description: '五维评分系统读取权重配置的位置',
    socketTypeCode: 'config_read',
    consumer: 'dopamine-engine',
    location: JSON.stringify({ page: 'global', component: 'DopamineEngine', area: 'scoring', slot: 'weight-config' }),
    isRequired: true,
    allowMultiple: false,
  },
  {
    code: 'read_level_thresholds',
    name: '等级阈值读取位',
    description: '道德股权系统读取等级阈值配置的位置',
    socketTypeCode: 'config_read',
    consumer: 'moral-equity',
    location: JSON.stringify({ page: 'global', component: 'MoralEquityEngine', area: 'leveling', slot: 'threshold-config' }),
    isRequired: true,
    allowMultiple: false,
  },

  // ---- 行为插槽 ----
  {
    code: 'handler_task_complete',
    name: '任务完成处理位',
    description: '任务完成时触发的行为插槽',
    socketTypeCode: 'action_handler',
    consumer: 'moral-equity-page',
    location: JSON.stringify({ page: '/moral-equity/tasks', component: 'TaskCard', area: 'action', slot: 'complete-handler' }),
    isRequired: false,
    allowMultiple: false,
  },
]

// ============================================
// 默认连接 — 系统预装的插头→插槽连接
// ============================================

export interface DefaultConnection {
  plugCode: string
  socketCode: string
  signalChannel?: string
}

export const DEFAULT_CONNECTIONS: DefaultConnection[] = [
  // 词汇插头→词汇插槽
  { plugCode: 'vocab_value_unit', socketCode: 'display_value_unit', signalChannel: 'vocab:updated' },
  { plugCode: 'vocab_equity_name', socketCode: 'display_equity_name', signalChannel: 'vocab:updated' },
  { plugCode: 'vocab_good_deed', socketCode: 'display_good_deed', signalChannel: 'vocab:updated' },
  { plugCode: 'vocab_streak', socketCode: 'display_streak', signalChannel: 'vocab:updated' },

  // UI插头→UI插槽
  { plugCode: 'ui_five_dim_radar', socketCode: 'render_moral_score', signalChannel: 'ui:updated' },
  { plugCode: 'ui_progress_bar', socketCode: 'render_level_progress', signalChannel: 'ui:updated' },

  // 配置插头→配置插槽
  { plugCode: 'config_five_dim_weights', socketCode: 'read_dim_weights', signalChannel: 'config:updated' },
  { plugCode: 'config_level_thresholds', socketCode: 'read_level_thresholds', signalChannel: 'config:updated' },

  // 信号插头→信号插槽
  { plugCode: 'signal_dopamine_listener', socketCode: 'channel_action_handler', signalChannel: 'signal:registered' },

  // 行为插头→行为插槽
  { plugCode: 'action_complete_task', socketCode: 'handler_task_complete', signalChannel: 'action:bound' },
]

// ============================================
// 插板工具函数
// ============================================

/**
 * 检查插头型号是否兼容插槽型号
 */
export function isCompatible(plugTypeCode: string, socketTypeCode: string): boolean {
  return COMPATIBLE_RULES.some(
    r => r.plugTypeCode === plugTypeCode && r.socketTypeCode === socketTypeCode
  )
}

/**
 * 获取插槽型号可接受的所有插头型号
 */
export function getCompatiblePlugTypes(socketTypeCode: string): CompatibleRuleDef[] {
  return COMPATIBLE_RULES
    .filter(r => r.socketTypeCode === socketTypeCode)
    .sort((a, b) => b.priority - a.priority)
}

/**
 * 获取插头型号可插入的所有插槽型号
 */
export function getCompatibleSocketTypes(plugTypeCode: string): CompatibleRuleDef[] {
  return COMPATIBLE_RULES
    .filter(r => r.plugTypeCode === plugTypeCode)
    .sort((a, b) => b.priority - a.priority)
}

/**
 * 获取插板系统统计
 */
export function getPlugBoardStats() {
  return {
    plugTypes: PLUG_TYPES.length,
    socketTypes: SOCKET_TYPES.length,
    compatibleRules: COMPATIBLE_RULES.length,
    defaultPlugs: DEFAULT_PLUGS.length,
    defaultSockets: DEFAULT_SOCKETS.length,
    defaultConnections: DEFAULT_CONNECTIONS.length,
    plugsByType: PLUG_TYPES.map(pt => ({
      code: pt.code,
      name: pt.name,
      count: DEFAULT_PLUGS.filter(p => p.plugTypeCode === pt.code).length,
    })),
    socketsByType: SOCKET_TYPES.map(st => ({
      code: st.code,
      name: st.name,
      count: DEFAULT_SOCKETS.filter(s => s.socketTypeCode === st.code).length,
    })),
  }
}

/**
 * 判断兼容规则是否为直接匹配（同型号）
 */
export function isDirectMatch(plugTypeCode: string, socketTypeCode: string): boolean {
  return plugTypeCode === socketTypeCode.split('_')[0]
}

/**
 * 判断兼容规则是否为跨型号兼容
 */
export function isCrossTypeCompat(plugTypeCode: string, socketTypeCode: string): boolean {
  return isCompatible(plugTypeCode, socketTypeCode) && !isDirectMatch(plugTypeCode, socketTypeCode)
}

/**
 * 获取兼容规则的优先级
 */
export function getCompatPriority(plugTypeCode: string, socketTypeCode: string): number {
  const rule = COMPATIBLE_RULES.find(
    r => r.plugTypeCode === plugTypeCode && r.socketTypeCode === socketTypeCode
  )
  return rule?.priority ?? 0
}
