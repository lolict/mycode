'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnhancedAppGrid } from '@/components/layout/EnhancedAppGrid'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SuspenseBoundary } from '@/components/ui/suspense-boundary'
import { useAppStore, useAppActions } from '@/lib/store'
import { 
  Heart, 
  Users, 
  Target, 
  BookOpen, 
  Star,
  Activity,
  Brain,
  Palette,
  Code,
  Sun,
  ShoppingBag,
  Film,
  Music,
  Radio,
  Megaphone,
  Lightbulb,
  Factory,
  ShoppingCart,
  Smartphone,
  Clock,
  Database,
  Scale,
  TrendingUp,
  ArrowRight,
  Grid3X3,
  Eye
} from 'lucide-react'

interface AppInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: string
  status: 'active' | 'developing' | 'planned'
  path: string
  features: string[]
  priority?: number
  recentlyUsed?: boolean
  isFavorite?: boolean
}

export default function AppsCenter() {
  const [apps, setApps] = useState<AppInfo[]>([])
  const { recordAppUsage, toggleFavorite, isFavorite } = useAppActions()

  useEffect(() => {
    // 从状态管理获取最近使用和收藏数据
    const recentlyUsedApps = useAppStore.getState().getRecentlyUsedApps(5)
    const favorites = useAppStore.getState().favorites

    const appsData: AppInfo[] = [
      // 核心应用 - 高优先级
      {
        id: 'projects',
        name: '助残项目',
        description: '发起和参与助残联建项目，支持农村残疾人就业、医疗、教育',
        icon: <Target className="h-8 w-8" />,
        color: 'bg-pink-500',
        category: 'core',
        status: 'active',
        path: '/projects',
        features: ['项目发起', '联建参与', '资金监管', '进度跟踪'],
        priority: 1,
        recentlyUsed: recentlyUsedApps.includes('projects'),
        isFavorite: !!favorites['projects']
      },
      {
        id: 'ledger',
        name: '记名账本',
        description: '记录个人贡献，实现人生价值，构建残健共同体',
        icon: <BookOpen className="h-8 w-8" />,
        color: 'bg-purple-500',
        category: 'core',
        status: 'active',
        path: '/ledger',
        features: ['贡献记录', '价值计算', '账户庇佑', '历史追溯'],
        priority: 2,
        recentlyUsed: recentlyUsedApps.includes('ledger'),
        isFavorite: !!favorites['ledger']
      },
      {
        id: 'account',
        name: '共同体账户',
        description: '残健共同体账户余额管理和分配',
        icon: <Users className="h-8 w-8" />,
        color: 'bg-blue-500',
        category: 'core',
        status: 'active',
        path: '/account',
        features: ['余额管理', '分配方案', '交易记录', '账户统计'],
        priority: 3,
        recentlyUsed: recentlyUsedApps.includes('account'),
        isFavorite: !!favorites['account']
      },
      {
        id: 'market',
        name: '应用市场',
        description: '发现和安装预构建的模块化应用，一键部署快速启动',
        icon: <ShoppingBag className="h-8 w-8" />,
        color: 'bg-emerald-500',
        category: 'core',
        status: 'active',
        path: '/market',
        features: ['应用市场', '模板安装', '一键部署', '快速启动'],
        priority: 4,
        recentlyUsed: recentlyUsedApps.includes('market'),
        isFavorite: !!favorites['market']
      },
      {
        id: 'builder',
        name: '应用构建器',
        description: '拖拽组装模块，可视化构建您的专属应用',
        icon: <Code className="h-8 w-8" />,
        color: 'bg-cyan-500',
        category: 'core',
        status: 'active',
        path: '/builder',
        features: ['拖拽构建', '模块组装', '可视化编辑', '自定义配置'],
        priority: 5,
        recentlyUsed: recentlyUsedApps.includes('builder'),
        isFavorite: !!favorites['builder']
      },

      // 专项账本应用 - 中等优先级
      {
        id: 'medical-ledger',
        name: '病历账本',
        description: '记录医疗历史、病情起因、治疗过程，健全人向残疾人倾斜',
        icon: <Activity className="h-8 w-8" />,
        color: 'bg-red-500',
        category: 'ledger',
        status: 'active',
        path: '/ledger/medical',
        features: ['医疗记录', '治疗过程', '康复跟踪', '30%庇佑'],
        priority: 10,
        recentlyUsed: recentlyUsedApps.includes('medical-ledger'),
        isFavorite: !!favorites['medical-ledger']
      },
      {
        id: 'dream-ledger',
        name: '梦境账本',
        description: '记录梦想、愿景、人生规划，城市人向农村人倾斜',
        icon: <Star className="h-8 w-8" />,
        color: 'bg-indigo-500',
        category: 'ledger',
        status: 'active',
        path: '/ledger/dream',
        features: ['梦想记录', '人生规划', '愿景实现', '20%庇佑'],
        priority: 11,
        recentlyUsed: recentlyUsedApps.includes('dream-ledger'),
        isFavorite: !!favorites['dream-ledger']
      },
      {
        id: 'reality-ledger',
        name: '实账本',
        description: '记录真实经历、生活事件，已婚者向未婚者倾斜',
        icon: <Eye className="h-8 w-8" />,
        color: 'bg-green-500',
        category: 'ledger',
        status: 'active',
        path: '/ledger/reality',
        features: ['真实记录', '生活经历', '事件追溯', '40%庇佑'],
        priority: 12,
        recentlyUsed: recentlyUsedApps.includes('reality-ledger'),
        isFavorite: !!favorites['reality-ledger']
      },

      // 共同体账户扩展 - 低优先级
      {
        id: 'intellectual-ledger',
        name: '德智共同体',
        description: '智力成果创造价值的余额，智力账本分配方案',
        icon: <Brain className="h-8 w-8" />,
        color: 'bg-cyan-500',
        category: 'community',
        status: 'developing',
        path: '#',
        features: ['智力成果', '价值评估', '知识贡献', '创新激励'],
        priority: 20,
        recentlyUsed: recentlyUsedApps.includes('intellectual-ledger'),
        isFavorite: !!favorites['intellectual-ledger']
      },
      {
        id: 'art-ledger',
        name: '德艺共同体',
        description: '艺术创作价值分配，艺术账本分配方案',
        icon: <Palette className="h-8 w-8" />,
        color: 'bg-purple-600',
        category: 'community',
        status: 'developing',
        path: '#',
        features: ['艺术创作', '作品评估', '版权保护', '价值分配'],
        priority: 21,
        recentlyUsed: recentlyUsedApps.includes('art-ledger'),
        isFavorite: !!favorites['art-ledger']
      },
      {
        id: 'tech-ledger',
        name: '德码共同体',
        description: '技术贡献价值分配，技术账本分配方案',
        icon: <Code className="h-8 w-8" />,
        color: 'bg-gray-700',
        category: 'community',
        status: 'developing',
        path: '#',
        features: ['技术贡献', '代码价值', '开发成果', '技术创新'],
        priority: 22,
        recentlyUsed: recentlyUsedApps.includes('tech-ledger'),
        isFavorite: !!favorites['tech-ledger']
      },
      {
        id: 'solar-ledger',
        name: '德伏共同体',
        description: '光伏能源贡献分配，光伏账本分配方案',
        icon: <Sun className="h-8 w-8" />,
        color: 'bg-yellow-500',
        category: 'community',
        status: 'planned',
        path: '#',
        features: ['光伏贡献', '绿色能源', '环保价值', '可持续发展'],
        priority: 30,
        recentlyUsed: recentlyUsedApps.includes('solar-ledger'),
        isFavorite: !!favorites['solar-ledger']
      },
      {
        id: 'sales-ledger',
        name: '德售共同体',
        description: '公益销售分配方案，支持农产品销售',
        icon: <ShoppingCart className="h-8 w-8" />,
        color: 'bg-orange-500',
        category: 'community',
        status: 'planned',
        path: '#',
        features: ['公益销售', '农产品', '销售渠道', '收益分配'],
        priority: 31,
        recentlyUsed: recentlyUsedApps.includes('sales-ledger'),
        isFavorite: !!favorites['sales-ledger']
      },

      // 基础设施应用
      {
        id: 'public-ledger',
        name: '公器共同体',
        description: '私人设备分布式记账系统的节点数据存储算力支持网络',
        icon: <Smartphone className="h-8 w-8" />,
        color: 'bg-violet-600',
        category: 'infrastructure',
        status: 'developing',
        path: '#',
        features: ['分布式记账', '节点支持', '算力共享', '数据存储'],
        priority: 25,
        recentlyUsed: recentlyUsedApps.includes('public-ledger'),
        isFavorite: !!favorites['public-ledger']
      },
      {
        id: 'time-ledger',
        name: '时间账本',
        description: '德时共同体账户余额，时间价值分配系统',
        icon: <Clock className="h-8 w-8" />,
        color: 'bg-rose-500',
        category: 'infrastructure',
        status: 'developing',
        path: '#',
        features: ['时间价值', '时长记录', '效率评估', '时间投资'],
        priority: 26,
        recentlyUsed: recentlyUsedApps.includes('time-ledger'),
        isFavorite: !!favorites['time-ledger']
      }
    ]

    setApps(appsData)
  }, [recordAppUsage, toggleFavorite, isFavorite])

  const categories = [
    { id: 'all', name: '全部应用', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'core', name: '核心应用', icon: <Heart className="h-4 w-4" /> },
    { id: 'ledger', name: '专项账本', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'community', name: '共同体账户', icon: <Users className="h-4 w-4" /> },
    { id: 'infrastructure', name: '基础设施', icon: <TrendingUp className="h-4 w-4" /> }
  ]

  // 处理应用点击 - 记录最近使用
  const handleAppClick = (appId: string) => {
    recordAppUsage(appId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Grid3X3 className="h-16 w-16" />
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              应用中心
            </h1>
            <p className="text-xl opacity-90 mb-8">
              圆聚助残平台模块化应用系统<br />
              一个软件，无缝切换所有功能模块
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                <Heart className="h-4 w-4 mr-2" />
                残健共同体
              </Button>
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                <TrendingUp className="h-4 w-4 mr-2" />
                新天枰倾斜
              </Button>
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                <Users className="h-4 w-4 mr-2" />
                智能合约
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <ErrorBoundary>
            <SuspenseBoundary loadingType="card" loadingCount={8}>
              <EnhancedAppGrid apps={apps} categories={categories} />
            </SuspenseBoundary>
          </ErrorBoundary>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">模块化架构 · 无缝切换</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            基于Next.js前端技术实现的模块化系统，可动态组装UI组件、后端API和服务器逻辑<br />
            如同给软件换性别、换灵魂、换肉身，骨架共用最大公约数的优质设计
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">Web3.0</Badge>
            <Badge variant="secondary" className="px-3 py-1">区块链</Badge>
            <Badge variant="secondary" className="px-3 py-1">智能合约</Badge>
            <Badge variant="secondary" className="px-3 py-1">分布式</Badge>
            <Badge variant="secondary" className="px-3 py-1">开源</Badge>
          </div>
        </div>
      </section>
    </div>
  )
}