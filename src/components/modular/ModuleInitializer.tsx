'use client'

import { useEffect } from 'react'
import { useModuleRegistry } from './ModuleRegistry'

interface ModuleConfig {
  id: string
  name: string
  version: string
  description: string
  category: string
  dependencies?: string[]
  config?: Record<string, any>
  icon?: React.ReactNode
}

export function ModuleInitializer({ children }: { children: React.ReactNode }) {
  const { registerModule } = useModuleRegistry()

  useEffect(() => {
    // 注册核心模块
    const coreModules: ModuleConfig[] = [
      {
        id: 'projects',
        name: '助残项目',
        version: '1.0.0',
        description: '发起和参与助残联建项目，支持农村残疾人就业、医疗、教育',
        category: 'core',
        config: {
          icon: 'target',
          color: 'pink',
          path: '/projects'
        }
      },
      {
        id: 'ledger',
        name: '记名账本',
        version: '2.0.0',
        description: '记录个人贡献，实现人生价值，构建残健共同体',
        category: 'core',
        config: {
          icon: 'book',
          color: 'purple',
          path: '/ledger'
        }
      },
      {
        id: 'account',
        name: '共同体账户',
        version: '1.5.0',
        description: '残健共同体账户余额管理和分配',
        category: 'core',
        config: {
          icon: 'users',
          color: 'blue',
          path: '/account'
        }
      },
      {
        id: 'market',
        name: '应用市场',
        version: '1.0.0',
        description: '发现和安装预构建的模块化应用',
        category: 'core',
        config: {
          icon: 'shopping-bag',
          color: 'emerald',
          path: '/market'
        }
      },
      {
        id: 'builder',
        name: '应用构建器',
        version: '1.0.0',
        description: '拖拽组装模块，可视化构建应用',
        category: 'core',
        config: {
          icon: 'code',
          color: 'cyan',
          path: '/builder'
        }
      }
    ]

    // 注册账本模块
    const ledgerModules: ModuleConfig[] = [
      {
        id: 'medical-ledger',
        name: '病历账本',
        version: '1.0.0',
        description: '记录医疗历史，守护健康人生',
        category: 'ledger',
        config: {
          icon: 'activity',
          color: 'red',
          path: '/ledger/medical',
          protection: 30
        }
      },
      {
        id: 'dream-ledger',
        name: '梦境账本',
        version: '1.0.0',
        description: '记录美好梦想，照亮人生方向',
        category: 'ledger',
        config: {
          icon: 'star',
          color: 'indigo',
          path: '/ledger/dream',
          protection: 20
        }
      },
      {
        id: 'reality-ledger',
        name: '实账本',
        version: '1.0.0',
        description: '记录真实经历，见证人生历程',
        category: 'ledger',
        config: {
          icon: 'eye',
          color: 'green',
          path: '/ledger/reality',
          protection: 40
        }
      }
    ]

    // 注册共同体模块
    const communityModules: ModuleConfig[] = [
      {
        id: 'intellectual-ledger',
        name: '德智共同体',
        version: '1.0.0',
        description: '智力成果创造价值的余额',
        category: 'community',
        config: {
          icon: 'brain',
          color: 'cyan'
        }
      },
      {
        id: 'art-ledger',
        name: '德艺共同体',
        version: '1.0.0',
        description: '艺术创作价值分配',
        category: 'community',
        config: {
          icon: 'palette',
          color: 'purple'
        }
      },
      {
        id: 'tech-ledger',
        name: '德码共同体',
        version: '1.0.0',
        description: '技术贡献价值分配',
        category: 'community',
        config: {
          icon: 'code',
          color: 'gray'
        }
      }
    ]

    // 注册基础设施模块
    const infrastructureModules: ModuleConfig[] = [
      {
        id: 'public-ledger',
        name: '公器共同体',
        version: '1.0.0',
        description: '私人设备分布式记账系统',
        category: 'infrastructure',
        config: {
          icon: 'smartphone',
          color: 'violet'
        }
      },
      {
        id: 'time-ledger',
        name: '时间账本',
        version: '1.0.0',
        description: '德时共同体账户余额',
        category: 'infrastructure',
        config: {
          icon: 'clock',
          color: 'rose'
        }
      },
      {
        id: 'data-ledger',
        name: '德数共同体',
        version: '1.0.0',
        description: '为训练AI提供的数据质量',
        category: 'infrastructure',
        config: {
          icon: 'database',
          color: 'blue'
        }
      }
    ]

    // 注册所有模块
    const allModules = [...coreModules, ...ledgerModules, ...communityModules, ...infrastructureModules]
    
    allModules.forEach(module => {
      registerModule(module)
    })
  }, [registerModule])

  return <>{children}</>
}