/**
 * 德系-插板一体化集成
 *
 * 核心理念：每个德系模块都是一个插头
 * - 基础设施类 → config/data 型插头
 * - 出行物流类 → action 型插头
 * - 经济金融类 → data 型插头
 * - 医疗健康类 → action/signal 型插头
 * - 文化教育类 → vocab/ui 型插头
 * - 治理监督类 → signal 型插头
 * - 应急安全类 → signal 型插头（最高优先级）
 * - 社交传播类 → signal 型插头
 * - 创业赋能类 → data/action 型插头
 * - 记录存档类 → data 型插头
 */

import { DEXI_MODULES, DEXI_CATEGORIES, type DexiModuleDef, type DexiCategory } from './dexi-registry'
import { PLUG_TYPES, COMPATIBLE_RULES, type PlugTypeDef, type CompatibleRuleDef } from './plug-socket-registry'
import { PRESET_NEURAL_NODES, type NeuralNodeDef } from './plugboard'

// === 德系模块→插头型号映射 ===

type DexiPlugMapping = {
  moduleCode: string
  moduleName: string
  plugTypeCode: string  // 对应7种插头型号
  socketTypeCode: string  // 对应7种插槽型号
  neuralChannels: string[]  // 模块关联的神经信号频道
  signalWeight: number  // 信号权重(0-1)
  autoConnect: boolean  // 是否自动连接
}

// 分类→插头型号映射规则
const CATEGORY_PLUG_MAP: Record<string, { plugType: string; socketType: string; weight: number }> = {
  'infrastructure': { plugType: 'config', socketType: 'config_read', weight: 0.7 },
  'transport': { plugType: 'action', socketType: 'action_handler', weight: 0.8 },
  'finance': { plugType: 'data', socketType: 'data_input', weight: 0.6 },
  'medical': { plugType: 'action', socketType: 'action_handler', weight: 0.9 },
  'culture': { plugType: 'vocab', socketType: 'vocab_display', weight: 0.5 },
  'governance': { plugType: 'signal', socketType: 'signal_channel', weight: 0.7 },
  'emergency': { plugType: 'signal', socketType: 'signal_channel', weight: 1.0 },
  'social': { plugType: 'signal', socketType: 'signal_channel', weight: 0.6 },
  'innovation': { plugType: 'data', socketType: 'data_input', weight: 0.5 },
  'records': { plugType: 'data', socketType: 'data_input', weight: 0.4 },
}

// 每个分类的神经信号频道
const CATEGORY_NEURAL_CHANNELS: Record<string, string[]> = {
  'infrastructure': ['config:updated', 'system:infra'],
  'transport': ['action:transport', 'action:delivery', 'action:ride'],
  'finance': ['data:donation', 'data:payment', 'equity:update'],
  'medical': ['action:diagnosis', 'action:care', 'signal:health', 'action:emergency'],
  'culture': ['vocab:updated', 'ui:render', 'signal:culture'],
  'governance': ['signal:audit', 'signal:governance', 'signal:vote'],
  'emergency': ['signal:emergency', 'signal:alert', 'action:rescue'],
  'social': ['signal:social', 'signal:share', 'signal:notify'],
  'innovation': ['data:innovation', 'action:startup'],
  'records': ['data:record', 'data:archive'],
}

// 自动生成所有德系模块→插头的映射
export function generateDexiPlugMappings(): DexiPlugMapping[] {
  return DEXI_MODULES.map(module => {
    const categoryMap = CATEGORY_PLUG_MAP[module.category] || { plugType: 'data', socketType: 'data_input', weight: 0.5 }
    const channels = CATEGORY_NEURAL_CHANNELS[module.category] || ['signal:general']

    return {
      moduleCode: module.code,
      moduleName: module.name,
      plugTypeCode: categoryMap.plugType,
      socketTypeCode: categoryMap.socketType,
      neuralChannels: channels,
      signalWeight: categoryMap.weight,
      autoConnect: module.status === 'active',
    }
  })
}

// 获取德系模块的插头型号信息
export function getDexiPlugType(module: DexiModuleDef): PlugTypeDef | undefined {
  const mapping = CATEGORY_PLUG_MAP[module.category]
  if (!mapping) return undefined
  return PLUG_TYPES.find(pt => pt.code === mapping.plugType)
}

// 获取德系模块的兼容规则
export function getDexiCompatRules(module: DexiModuleDef): CompatibleRuleDef[] {
  const mapping = CATEGORY_PLUG_MAP[module.category]
  if (!mapping) return []
  return COMPATIBLE_RULES.filter(r => r.plugTypeCode === mapping.plugType)
}

// 获取分类→插头型号的完整映射
export function getCategoryPlugMap() {
  return Object.entries(CATEGORY_PLUG_MAP).map(([catId, mapping]) => {
    const category = DEXI_CATEGORIES.find(c => c.id === catId)
    const plugType = PLUG_TYPES.find(pt => pt.code === mapping.plugType)
    const moduleCount = DEXI_MODULES.filter(m => m.category === catId).length
    const neuralChannels = CATEGORY_NEURAL_CHANNELS[catId] || []

    return {
      categoryId: catId,
      categoryName: category?.name || catId,
      categoryIcon: category?.icon || 'Box',
      categoryColor: category?.color || 'from-gray-400 to-gray-500',
      plugTypeCode: mapping.plugType,
      plugTypeName: plugType?.name || mapping.plugType,
      socketTypeCode: mapping.socketType,
      signalWeight: mapping.weight,
      moduleCount,
      neuralChannels,
      modules: DEXI_MODULES.filter(m => m.category === catId).map(m => ({
        code: m.code,
        name: m.name,
        fullName: m.fullName,
        status: m.status,
        priority: m.priority,
      })),
    }
  })
}

// 获取神经节点与德系模块的关联
export function getNeuralDexiConnections() {
  const neuralNodes = PRESET_NEURAL_NODES
  const dexiMappings = generateDexiPlugMappings()

  return neuralNodes.map(node => {
    // 根据神经节点的输入频道匹配关联的德系模块
    const nodeChannels = node.inputs?.channels || []
    let relatedModules: Array<{ code: string; name: string; plugType: string; weight: number }>

    if (nodeChannels.includes('*')) {
      // 中继节点关联所有模块
      relatedModules = dexiMappings.map(m => ({
        code: m.moduleCode,
        name: m.moduleName,
        plugType: m.plugTypeCode,
        weight: m.signalWeight,
      }))
    } else {
      // 根据频道匹配
      relatedModules = dexiMappings
        .filter(m => m.neuralChannels.some(ch => nodeChannels.some(nc => ch.startsWith(nc.split(':')[0]))))
        .map(m => ({
          code: m.moduleCode,
          name: m.moduleName,
          plugType: m.plugTypeCode,
          weight: m.signalWeight,
        }))
    }

    return {
      nodeId: node.code,
      nodeName: node.name,
      nodeType: node.nodeType,
      relatedModuleCount: relatedModules.length,
      topModules: relatedModules.slice(0, 5),
    }
  })
}

// 获取完整的德系-插板-神经一体化统计
export function getDexiPlugNeuralStats() {
  const mappings = generateDexiPlugMappings()
  const categoryMap = getCategoryPlugMap()
  const neuralConnections = getNeuralDexiConnections()

  return {
    totalModules: DEXI_MODULES.length,
    totalCategories: DEXI_CATEGORIES.length,
    totalMappings: mappings.length,
    activeMappings: mappings.filter(m => m.autoConnect).length,
    plugTypeDistribution: PLUG_TYPES.map(pt => ({
      code: pt.code,
      name: pt.name,
      count: mappings.filter(m => m.plugTypeCode === pt.code).length,
      color: pt.color,
    })),
    categoryPlugMap: categoryMap,
    neuralConnections,
    signalWeights: {
      highest: mappings.reduce((max, m) => m.signalWeight > max.signalWeight ? m : max, mappings[0]),
      average: mappings.reduce((sum, m) => sum + m.signalWeight, 0) / mappings.length,
      byCategory: Object.fromEntries(
        Object.entries(CATEGORY_PLUG_MAP).map(([cat, map]) => [
          cat,
          mappings.filter(m => m.plugTypeCode === map.plugType).reduce((sum, m) => sum + m.signalWeight, 0) /
            Math.max(1, mappings.filter(m => m.plugTypeCode === map.plugType).length)
        ])
      ),
    },
  }
}
