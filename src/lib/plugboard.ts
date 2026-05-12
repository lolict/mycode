// ============================================
// 统一插板型号架构 (Unified PlugBoard Architecture)
// 圆聚助残公益众筹平台 - 通用插件化模块系统
// ============================================
//
// 核心理念：
// 所有组件都是"可插拔"的，通过统一的接口标准
// 实现"插头"和"插槽"的互插兼容。
// 7种插头型号 + 7种插槽型号 + 11条兼容规则
// 词汇型号、UI型号、插槽型号、插头型号
// 类型不同、功能不同，但接口统一。
// 方便神经网络的全能应用。
// ============================================

import {
  PLUG_TYPES, SOCKET_TYPES, COMPATIBLE_RULES,
  DEFAULT_PLUGS, DEFAULT_SOCKETS, DEFAULT_CONNECTIONS,
  isCompatible, getCompatiblePlugTypes, getCompatibleSocketTypes,
  isDirectMatch, isCrossTypeCompat, getPlugBoardStats,
  type PlugTypeDef, type SocketTypeDef, type CompatibleRuleDef,
  type PlugDef, type SocketDef, type DefaultConnection,
} from './plug-socket-registry'

// Re-export from plug-socket-registry for convenience
export {
  PLUG_TYPES, SOCKET_TYPES, COMPATIBLE_RULES,
  DEFAULT_PLUGS, DEFAULT_SOCKETS, DEFAULT_CONNECTIONS,
  isCompatible, getCompatiblePlugTypes, getCompatibleSocketTypes,
  isDirectMatch, isCrossTypeCompat, getPlugBoardStats,
  type PlugTypeDef, type SocketTypeDef, type CompatibleRuleDef,
  type PlugDef, type SocketDef, type DefaultConnection,
}

// === 接口规范 ===

export type PlugTypeCode = 'vocab' | 'ui' | 'data' | 'action' | 'signal' | 'style' | 'config'
export type SocketTypeCode = 'vocab_display' | 'ui_render' | 'data_input' | 'action_handler' | 'signal_channel' | 'style_apply' | 'config_read'

export interface PlugBoardInterface {
  /** 接口版本 */
  version: string
  /** 接口类型 */
  type: PlugTypeCode | SocketTypeCode | 'slot' | 'plug' | 'neural'
  /** 输入端口定义 */
  inputs: PortDef[]
  /** 输出端口定义 */
  outputs: PortDef[]
  /** 配置参数定义 */
  config: ConfigDef[]
  /** 兼容性标签 */
  compatibility: string[]
}

export interface PortDef {
  name: string
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
  required: boolean
  description: string
  defaultValue?: unknown
}

export interface ConfigDef {
  key: string
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: unknown
}

// === 插头型号 (Plug Model) ===

export interface PlugModelDef {
  code: string
  name: string
  plugType: PlugTypeCode
  version: string
  description: string
  interfaceSpec: PlugBoardInterface
  provider?: string
  pinValues?: Record<string, unknown>
  config?: Record<string, unknown>
  dependencies?: string[]
  tags?: string[]
  author?: string
  sourceModule?: string
}

// === 插槽型号 (Slot Model) ===

export interface SlotModelDef {
  code: string
  name: string
  slotType: SocketTypeCode
  version: string
  description: string
  interfaceSpec: PlugBoardInterface
  capacity: number
  requiredType?: PlugTypeCode
  consumer?: string
  location?: Record<string, unknown>
  isRequired?: boolean
  allowMultiple?: boolean
  config?: Record<string, unknown>
  tags?: string[]
}

// === 词汇型号 (Vocab Plug Model) ===

export interface VocabPlugModelDef {
  code: string
  name: string
  category: string
  vocabulary: Record<string, string>
  plugSpec: PlugBoardInterface
  slotSpec: PlugBoardInterface
  neuralMap?: Record<string, string[]>
  version: string
}

// === UI型号 (UI Plug Model) ===

export interface UIPlugModelDef {
  code: string
  name: string
  uiType: 'card' | 'form' | 'list' | 'chart' | 'layout' | 'dialog'
  template: Record<string, unknown>
  plugSpec: PlugBoardInterface
  slotSpec: PlugBoardInterface
  styleSpec?: Record<string, unknown>
  behaviorSpec?: Record<string, unknown>
  neuralMap?: Record<string, string[]>
  version: string
}

// === 神经节点 ===

export interface NeuralNodeDef {
  code: string
  name: string
  description?: string
  nodeType: 'relay' | 'sensor' | 'actuator' | 'processor' | 'gateway'
  activationFunction: 'relu' | 'sigmoid' | 'tanh' | 'step' | 'linear'
  threshold: number
  inputs?: Record<string, unknown>
  outputs?: Record<string, unknown>
  connections?: Record<string, unknown>
}

// === 插接兼容性校验（双层检查：规则层 + 接口层） ===

export function checkCompatibility(plug: PlugBoardInterface, slot: PlugBoardInterface): {
  compatible: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 版本兼容
  if (plug.version !== slot.version) {
    warnings.push(`版本不同: 插头v${plug.version} vs 插槽v${slot.version}`)
  }

  // 类型匹配
  if (slot.type !== 'slot' && plug.type !== slot.type) {
    warnings.push(`类型不同: 插头${plug.type} vs 插槽${slot.type}`)
  }

  // 输入端口匹配 - 插头的输出必须与插槽的输入对应
  for (const slotInput of slot.inputs) {
    if (slotInput.required) {
      const matchingOutput = plug.outputs.find(o => o.name === slotInput.name)
      if (!matchingOutput) {
        errors.push(`插槽需要输入 "${slotInput.name}" 但插头未提供对应输出`)
      } else if (matchingOutput.dataType !== slotInput.dataType && slotInput.dataType !== 'any') {
        errors.push(`端口 "${slotInput.name}" 类型不匹配: 插头输出${matchingOutput.dataType} vs 插槽输入${slotInput.dataType}`)
      }
    }
  }

  // 兼容性标签交叉
  const commonCompat = plug.compatibility.filter(c => slot.compatibility.includes(c))
  if (commonCompat.length === 0 && plug.compatibility.length > 0 && slot.compatibility.length > 0) {
    warnings.push('插头和插槽没有共同的兼容性标签')
  }

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 双层兼容性检查：先检查型号规则层，再检查接口层
 */
export function checkFullCompatibility(
  plugTypeCode: string,
  socketTypeCode: string,
  plugSpec?: PlugBoardInterface,
  slotSpec?: PlugBoardInterface,
): {
  compatible: boolean
  ruleCompatible: boolean
  interfaceCompatible: boolean
  ruleInfo?: CompatibleRuleDef
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 第一层：型号规则检查
  const ruleInfo = COMPATIBLE_RULES.find(
    r => r.plugTypeCode === plugTypeCode && r.socketTypeCode === socketTypeCode
  )
  const ruleCompatible = !!ruleInfo

  if (!ruleCompatible) {
    errors.push(`${plugTypeCode}型号插头与${socketTypeCode}型号插槽没有兼容规则`)
  }

  if (ruleInfo && isCrossTypeCompat(plugTypeCode, socketTypeCode)) {
    warnings.push(`跨型号兼容：${ruleInfo.description}（优先级: ${ruleInfo.priority}）`)
  }

  // 第二层：接口规格检查（如果提供了接口定义）
  let interfaceCompatible = true
  if (plugSpec && slotSpec) {
    const ifaceResult = checkCompatibility(plugSpec, slotSpec)
    interfaceCompatible = ifaceResult.compatible
    errors.push(...ifaceResult.errors)
    warnings.push(...ifaceResult.warnings)
  }

  return {
    compatible: ruleCompatible && interfaceCompatible,
    ruleCompatible,
    interfaceCompatible,
    ruleInfo,
    errors,
    warnings,
  }
}

// === 预定义的插板型号 ===

// 标准接口规范 - 所有型号的基础
const STANDARD_INTERFACE_V1: PlugBoardInterface = {
  version: '1.0.0',
  type: 'plug',
  inputs: [
    { name: 'data', dataType: 'any', required: true, description: '输入数据' },
    { name: 'config', dataType: 'object', required: false, description: '配置参数' },
  ],
  outputs: [
    { name: 'result', dataType: 'any', required: true, description: '输出结果' },
    { name: 'status', dataType: 'string', required: true, description: '执行状态' },
  ],
  config: [
    { key: 'enabled', dataType: 'boolean', required: false, description: '是否启用', defaultValue: true },
    { key: 'priority', dataType: 'number', required: false, description: '优先级', defaultValue: 0 },
  ],
  compatibility: ['standard-v1'],
}

// === 预定义词汇型号 ===

export const PRESET_VOCAB_MODELS: VocabPlugModelDef[] = [
  {
    code: 'VOCAB-MODEL-A',
    name: '五德词汇基础型',
    category: 'core-virtue',
    vocabulary: { '仁': '关爱助人', '义': '公正守信', '礼': '尊重有序', '智': '明辨是非', '信': '诚实可靠' },
    plugSpec: {
      version: '1.0.0',
      type: 'vocab',
      inputs: [
        { name: 'word', dataType: 'string', required: true, description: '待查询的词汇' },
      ],
      outputs: [
        { name: 'meaning', dataType: 'string', required: true, description: '词汇释义' },
        { name: 'virtue', dataType: 'string', required: false, description: '对应德目' },
      ],
      config: [
        { key: 'category', dataType: 'string', required: false, description: '词汇分类', defaultValue: 'core-virtue' },
      ],
      compatibility: ['standard-v1', 'vocab-v1'],
    },
    slotSpec: {
      version: '1.0.0',
      type: 'vocab',
      inputs: [
        { name: 'meaning', dataType: 'string', required: true, description: '词汇释义' },
        { name: 'context', dataType: 'string', required: false, description: '上下文' },
      ],
      outputs: [
        { name: 'matchedWords', dataType: 'array', required: true, description: '匹配的词汇列表' },
      ],
      config: [],
      compatibility: ['standard-v1', 'vocab-v1'],
    },
    neuralMap: {
      '仁': ['benevolence', 'kindness'],
      '义': ['righteousness', 'justice'],
      '礼': ['propriety', 'respect'],
      '智': ['wisdom', 'intelligence'],
      '信': ['trust', 'integrity'],
    },
    version: '1.0.0',
  },
  {
    code: 'VOCAB-MODEL-B',
    name: '助残词汇专业型',
    category: 'disability',
    vocabulary: { '无障碍': '消除障碍实现平等', '融合': '残健共融', '赋能': '帮助获得能力', '自立': '独立自主生活' },
    plugSpec: {
      version: '1.0.0',
      type: 'vocab',
      inputs: [
        { name: 'word', dataType: 'string', required: true, description: '待查询词汇' },
        { name: 'detail', dataType: 'boolean', required: false, description: '是否返回详情', defaultValue: false },
      ],
      outputs: [
        { name: 'meaning', dataType: 'string', required: true, description: '词汇释义' },
        { name: 'usage', dataType: 'string', required: false, description: '用法示例' },
        { name: 'relatedTerms', dataType: 'array', required: false, description: '相关词汇' },
      ],
      config: [
        { key: 'category', dataType: 'string', required: false, description: '词汇分类', defaultValue: 'disability' },
      ],
      compatibility: ['standard-v1', 'vocab-v1'],
    },
    slotSpec: {
      version: '1.0.0',
      type: 'vocab',
      inputs: [
        { name: 'meaning', dataType: 'string', required: true, description: '释义' },
      ],
      outputs: [
        { name: 'matchedWords', dataType: 'array', required: true, description: '匹配词汇' },
      ],
      config: [],
      compatibility: ['standard-v1', 'vocab-v1'],
    },
    neuralMap: {
      '无障碍': ['accessibility', 'barrier-free'],
      '融合': ['inclusion', 'integration'],
      '赋能': ['empowerment', 'ability'],
      '自立': ['independence', 'self-reliance'],
    },
    version: '1.0.0',
  },
]

// === 预定义UI型号 ===

export const PRESET_UI_MODELS: UIPlugModelDef[] = [
  {
    code: 'UI-MODEL-CARD-A',
    name: '项目卡片基础型',
    uiType: 'card',
    template: {
      layout: 'vertical',
      sections: ['image', 'title', 'description', 'progress', 'actions'],
    },
    plugSpec: {
      version: '1.0.0',
      type: 'ui',
      inputs: [
        { name: 'projectId', dataType: 'string', required: true, description: '项目ID' },
      ],
      outputs: [
        { name: 'cardHtml', dataType: 'string', required: true, description: '卡片HTML' },
        { name: 'events', dataType: 'object', required: false, description: '交互事件' },
      ],
      config: [
        { key: 'showProgress', dataType: 'boolean', required: false, description: '显示进度', defaultValue: true },
        { key: 'showActions', dataType: 'boolean', required: false, description: '显示操作按钮', defaultValue: true },
      ],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    slotSpec: {
      version: '1.0.0',
      type: 'ui',
      inputs: [
        { name: 'cardHtml', dataType: 'string', required: true, description: '卡片HTML' },
        { name: 'position', dataType: 'number', required: false, description: '插入位置' },
      ],
      outputs: [
        { name: 'rendered', dataType: 'boolean', required: true, description: '是否渲染成功' },
      ],
      config: [
        { key: 'layout', dataType: 'string', required: false, description: '布局方式', defaultValue: 'grid' },
      ],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    version: '1.0.0',
  },
  {
    code: 'UI-MODEL-FORM-A',
    name: '捐款表单标准型',
    uiType: 'form',
    template: {
      layout: 'vertical',
      fields: ['amount', 'message', 'anonymous', 'paymentMethod'],
    },
    plugSpec: {
      version: '1.0.0',
      type: 'ui',
      inputs: [
        { name: 'projectId', dataType: 'string', required: true, description: '项目ID' },
      ],
      outputs: [
        { name: 'formHtml', dataType: 'string', required: true, description: '表单HTML' },
        { name: 'formData', dataType: 'object', required: true, description: '表单数据' },
      ],
      config: [
        { key: 'minAmount', dataType: 'number', required: false, description: '最低金额', defaultValue: 1 },
        { key: 'presetAmounts', dataType: 'array', required: false, description: '预设金额' },
      ],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    slotSpec: {
      version: '1.0.0',
      type: 'ui',
      inputs: [
        { name: 'formHtml', dataType: 'string', required: true, description: '表单HTML' },
      ],
      outputs: [
        { name: 'rendered', dataType: 'boolean', required: true, description: '渲染结果' },
      ],
      config: [],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    version: '1.0.0',
  },
]

// === 预定义插槽型号 ===

export const PRESET_SLOT_MODELS: SlotModelDef[] = [
  {
    code: 'SLOT-PAGE-001',
    name: '页面插槽',
    slotType: 'ui_render',
    version: '1.0.0',
    description: '页面级插槽，可接收UI型插头渲染完整页面',
    interfaceSpec: {
      version: '1.0.0',
      type: 'slot',
      inputs: [
        { name: 'component', dataType: 'object', required: true, description: 'React组件' },
        { name: 'props', dataType: 'object', required: false, description: '组件属性' },
      ],
      outputs: [
        { name: 'page', dataType: 'string', required: true, description: '页面路径' },
      ],
      config: [
        { key: 'layout', dataType: 'string', required: false, description: '布局模板', defaultValue: 'default' },
      ],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    capacity: 5,
    requiredType: 'ui',
  },
  {
    code: 'SLOT-SERVICE-001',
    name: '服务插槽',
    slotType: 'data_input',
    version: '1.0.0',
    description: '服务级插槽，可接收词汇型/神经型插头提供数据处理',
    interfaceSpec: {
      version: '1.0.0',
      type: 'slot',
      inputs: [
        { name: 'data', dataType: 'any', required: true, description: '输入数据' },
        { name: 'action', dataType: 'string', required: true, description: '执行动作' },
      ],
      outputs: [
        { name: 'result', dataType: 'any', required: true, description: '处理结果' },
      ],
      config: [],
      compatibility: ['standard-v1', 'vocab-v1', 'neural-v1'],
    },
    capacity: 10,
  },
  {
    code: 'SLOT-NEURAL-001',
    name: '神经节点插槽',
    slotType: 'signal_channel',
    version: '1.0.0',
    description: '神经网络插槽，可接收任意型号插头进行信号传递',
    interfaceSpec: {
      version: '1.0.0',
      type: 'slot',
      inputs: [
        { name: 'signal', dataType: 'any', required: true, description: '输入信号' },
        { name: 'weight', dataType: 'number', required: false, description: '权重', defaultValue: 1.0 },
      ],
      outputs: [
        { name: 'activated', dataType: 'boolean', required: true, description: '是否被激活' },
        { name: 'output', dataType: 'any', required: true, description: '输出信号' },
      ],
      config: [
        { key: 'threshold', dataType: 'number', required: false, description: '激活阈值', defaultValue: 0.5 },
        { key: 'activation', dataType: 'string', required: false, description: '激活函数', defaultValue: 'relu' },
      ],
      compatibility: ['standard-v1', 'neural-v1'],
    },
    capacity: 100,
  },
]

// === 预定义插头型号 ===

export const PRESET_PLUG_MODELS: PlugModelDef[] = [
  {
    code: 'PLUG-VOCAB-001',
    name: '词汇查询插头',
    plugType: 'vocab',
    version: '1.0.0',
    description: '提供道德词汇查询功能，可插入词汇插槽或神经插槽',
    interfaceSpec: {
      version: '1.0.0',
      type: 'vocab',
      inputs: [
        { name: 'word', dataType: 'string', required: true, description: '查询词汇' },
      ],
      outputs: [
        { name: 'meaning', dataType: 'string', required: true, description: '词汇释义' },
        { name: 'virtue', dataType: 'string', required: false, description: '对应德目' },
        { name: 'category', dataType: 'string', required: false, description: '词汇分类' },
      ],
      config: [],
      compatibility: ['standard-v1', 'vocab-v1'],
    },
    dependencies: [],
    tags: ['词汇', '查询', '道德'],
  },
  {
    code: 'PLUG-UI-001',
    name: 'UI渲染插头',
    plugType: 'ui',
    version: '1.0.0',
    description: '提供UI组件渲染能力，可插入页面插槽',
    interfaceSpec: {
      version: '1.0.0',
      type: 'ui',
      inputs: [
        { name: 'component', dataType: 'string', required: true, description: '组件名称' },
        { name: 'props', dataType: 'object', required: false, description: '组件属性' },
      ],
      outputs: [
        { name: 'rendered', dataType: 'string', required: true, description: '渲染结果' },
        { name: 'events', dataType: 'object', required: false, description: '事件回调' },
      ],
      config: [],
      compatibility: ['standard-v1', 'ui-v1'],
    },
    dependencies: [],
    tags: ['UI', '渲染', '组件'],
  },
  {
    code: 'PLUG-NEURAL-001',
    name: '神经信号插头',
    plugType: 'signal',
    version: '1.0.0',
    description: '提供神经网络信号传递能力，可插入任何兼容插槽',
    interfaceSpec: {
      version: '1.0.0',
      type: 'signal',
      inputs: [
        { name: 'signal', dataType: 'any', required: true, description: '输入信号' },
      ],
      outputs: [
        { name: 'output', dataType: 'any', required: true, description: '输出信号' },
        { name: 'activated', dataType: 'boolean', required: true, description: '激活状态' },
      ],
      config: [
        { key: 'weight', dataType: 'number', required: false, description: '信号权重', defaultValue: 1.0 },
      ],
      compatibility: ['standard-v1', 'neural-v1'],
    },
    dependencies: [],
    tags: ['神经网络', '信号', '传递'],
  },
]

// === 预定义神经节点 ===

export const PRESET_NEURAL_NODES: NeuralNodeDef[] = [
  {
    code: 'NEURAL-RELAY-001',
    name: '主信号中继',
    description: '系统主信号中继节点，负责信号的分发与路由',
    nodeType: 'relay',
    activationFunction: 'linear',
    threshold: 0.0,
    inputs: { channels: ['*'] },
    outputs: { channels: ['plug:connected', 'plug:disconnected', 'plug:updated'] },
  },
  {
    code: 'NEURAL-SENSOR-001',
    name: '道德行为传感器',
    description: '感知用户的道德行为并发出信号',
    nodeType: 'sensor',
    activationFunction: 'step',
    threshold: 0.5,
    inputs: { channels: ['action:donate', 'action:help', 'action:volunteer'] },
    outputs: { channels: ['dopamine:trigger'] },
  },
  {
    code: 'NEURAL-ACTUATOR-001',
    name: '多巴胺执行器',
    description: '接收信号后执行多巴胺分泌操作',
    nodeType: 'actuator',
    activationFunction: 'relu',
    threshold: 0.3,
    inputs: { channels: ['dopamine:trigger'] },
    outputs: { channels: ['equity:update', 'streak:update'] },
  },
]

// === 插板注册表（统一版） ===

export class PlugBoardRegistry {
  private plugs: Map<string, PlugModelDef> = new Map()
  private slots: Map<string, SlotModelDef> = new Map()
  private vocabModels: Map<string, VocabPlugModelDef> = new Map()
  private uiModels: Map<string, UIPlugModelDef> = new Map()
  private neuralNodes: Map<string, NeuralNodeDef> = new Map()

  constructor() {
    // 注册预定义插头型号
    for (const plug of PRESET_PLUG_MODELS) {
      this.plugs.set(plug.code, plug)
    }
    // 注册预定义插槽型号
    for (const slot of PRESET_SLOT_MODELS) {
      this.slots.set(slot.code, slot)
    }
    // 注册预定义词汇型号
    for (const vocab of PRESET_VOCAB_MODELS) {
      this.vocabModels.set(vocab.code, vocab)
    }
    // 注册预定义UI型号
    for (const ui of PRESET_UI_MODELS) {
      this.uiModels.set(ui.code, ui)
    }
    // 注册预定义神经节点
    for (const node of PRESET_NEURAL_NODES) {
      this.neuralNodes.set(node.code, node)
    }
  }

  // --- 注册方法 ---

  registerPlug(plug: PlugModelDef): void {
    this.plugs.set(plug.code, plug)
  }

  registerSlot(slot: SlotModelDef): void {
    this.slots.set(slot.code, slot)
  }

  registerVocabModel(vocab: VocabPlugModelDef): void {
    this.vocabModels.set(vocab.code, vocab)
  }

  registerUIModel(ui: UIPlugModelDef): void {
    this.uiModels.set(ui.code, ui)
  }

  registerNeuralNode(node: NeuralNodeDef): void {
    this.neuralNodes.set(node.code, node)
  }

  // --- 获取方法 ---

  getPlug(code: string): PlugModelDef | undefined {
    return this.plugs.get(code)
  }

  getSlot(code: string): SlotModelDef | undefined {
    return this.slots.get(code)
  }

  getVocabModel(code: string): VocabPlugModelDef | undefined {
    return this.vocabModels.get(code)
  }

  getUIModel(code: string): UIPlugModelDef | undefined {
    return this.uiModels.get(code)
  }

  getNeuralNode(code: string): NeuralNodeDef | undefined {
    return this.neuralNodes.get(code)
  }

  // --- 列表方法 ---

  listPlugs(): PlugModelDef[] {
    return Array.from(this.plugs.values())
  }

  listSlots(): SlotModelDef[] {
    return Array.from(this.slots.values())
  }

  listVocabModels(): VocabPlugModelDef[] {
    return Array.from(this.vocabModels.values())
  }

  listUIModels(): UIPlugModelDef[] {
    return Array.from(this.uiModels.values())
  }

  listNeuralNodes(): NeuralNodeDef[] {
    return Array.from(this.neuralNodes.values())
  }

  // --- 连接与兼容性方法 ---

  /**
   * 尝试连接插头到插槽（双层检查：规则层+接口层）
   */
  connect(plugCode: string, slotCode: string): {
    success: boolean
    errors: string[]
    warnings: string[]
  } {
    const plug = this.plugs.get(plugCode)
    const slot = this.slots.get(slotCode)

    if (!plug) return { success: false, errors: [`插头 ${plugCode} 不存在`], warnings: [] }
    if (!slot) return { success: false, errors: [`插槽 ${slotCode} 不存在`], warnings: [] }

    // 使用双层兼容性检查
    const result = checkFullCompatibility(
      plug.plugType,
      slot.slotType,
      plug.interfaceSpec,
      slot.interfaceSpec,
    )

    return {
      success: result.compatible,
      errors: result.errors,
      warnings: result.warnings,
    }
  }

  /**
   * 通过型号规则检查兼容性（用于数据库中的插头/插槽实例）
   */
  connectByType(plugTypeCode: string, socketTypeCode: string): {
    success: boolean
    errors: string[]
    warnings: string[]
    ruleInfo?: CompatibleRuleDef
  } {
    const result = checkFullCompatibility(plugTypeCode, socketTypeCode)
    return {
      success: result.compatible,
      errors: result.errors,
      warnings: result.warnings,
      ruleInfo: result.ruleInfo,
    }
  }

  /**
   * 查找与指定插头兼容的所有插槽
   */
  findCompatibleSlots(plugCode: string): { slot: SlotModelDef; compatible: boolean; warnings: string[] }[] {
    const plug = this.plugs.get(plugCode)
    if (!plug) return []

    return this.listSlots().map(slot => {
      const result = checkFullCompatibility(plug.plugType, slot.slotType, plug.interfaceSpec, slot.interfaceSpec)
      return { slot, compatible: result.compatible, warnings: result.warnings }
    })
  }

  /**
   * 查找与指定插槽兼容的所有插头
   */
  findCompatiblePlugs(slotCode: string): { plug: PlugModelDef; compatible: boolean; warnings: string[] }[] {
    const slot = this.slots.get(slotCode)
    if (!slot) return []

    return this.listPlugs().map(plug => {
      const result = checkFullCompatibility(plug.plugType, slot.slotType, plug.interfaceSpec, slot.interfaceSpec)
      return { plug, compatible: result.compatible, warnings: result.warnings }
    })
  }

  /**
   * 获取插板系统完整统计
   */
  getStats() {
    const registryStats = getPlugBoardStats()
    return {
      ...registryStats,
      presetPlugs: this.plugs.size,
      presetSlots: this.slots.size,
      presetVocabModels: this.vocabModels.size,
      presetUIModels: this.uiModels.size,
      presetNeuralNodes: this.neuralNodes.size,
    }
  }
}

// 全局单例
export const plugBoardRegistry = new PlugBoardRegistry()
