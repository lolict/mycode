'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModularApp } from './ModularApp'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Users, 
  TrendingUp,
  Clock,
  Code,
  Palette
} from 'lucide-react'

interface AppTemplate {
  id: string
  name: string
  description: string
  category: string
  author: string
  version: string
  downloads: number
  rating: number
  modules: string[]
  layout: 'grid' | 'flex' | 'tabs'
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  icon?: React.ReactNode
  preview?: string
}

interface AppMarketProps {
  onInstall?: (template: AppTemplate) => void
  onPreview?: (template: AppTemplate) => void
}

export function AppMarket({ onInstall, onPreview }: AppMarketProps) {
  const [templates, setTemplates] = useState<AppTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [previewTemplate, setPreviewTemplate] = useState<AppTemplate | null>(null)

  useEffect(() => {
    // 模拟加载应用模板数据
    const mockTemplates: AppTemplate[] = [
      {
        id: 'yuanju-platform',
        name: '圆聚助残平台',
        description: '完整的助残公益平台，包含项目管理、账本系统、共同体账户等核心功能',
        category: 'platform',
        author: '莫姓成年',
        version: '1.0.0',
        downloads: 1250,
        rating: 4.8,
        modules: ['projects', 'ledger', 'account', 'medical-ledger', 'dream-ledger', 'reality-ledger'],
        layout: 'tabs',
        tags: ['公益', '助残', '众筹', '账本'],
        isPublic: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        icon: <Heart className="h-6 w-6" />
      },
      {
        id: 'ledger-system',
        name: '记名账本系统',
        description: '专业的个人贡献记录系统，支持多种账本类型和价值评估',
        category: 'ledger',
        author: '圆聚团队',
        version: '2.1.0',
        downloads: 890,
        rating: 4.6,
        modules: ['ledger', 'medical-ledger', 'dream-ledger', 'reality-ledger'],
        layout: 'grid',
        tags: ['账本', '贡献', '记录', '价值'],
        isPublic: true,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        icon: <BookOpen className="h-6 w-6" />
      },
      {
        id: 'community-finance',
        name: '共同体金融',
        description: '残健共同体账户管理系统，支持多种分配方案和智能合约',
        category: 'finance',
        author: '德智共同体',
        version: '1.5.0',
        downloads: 650,
        rating: 4.5,
        modules: ['account', 'intellectual-ledger', 'art-ledger', 'tech-ledger'],
        layout: 'tabs',
        tags: ['金融', '共同体', '智能合约', '分配'],
        isPublic: true,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-16',
        icon: <TrendingUp className="h-6 w-6" />
      },
      {
        id: 'creative-studio',
        name: '创作工作室',
        description: '艺术创作和内容生产平台，支持多种创作工具和价值分配',
        category: 'creative',
        author: '德艺共同体',
        version: '1.2.0',
        downloads: 420,
        rating: 4.7,
        modules: ['art-ledger', 'drama-ledger', 'music-ledger', 'media-ledger'],
        layout: 'flex',
        tags: ['创作', '艺术', '音乐', '媒体'],
        isPublic: true,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-12',
        icon: <Palette className="h-6 w-6" />
      },
      {
        id: 'tech-hub',
        name: '技术中心',
        description: '技术开发和创新平台，支持代码管理、技术评估和创新认证',
        category: 'technology',
        author: '德码共同体',
        version: '2.0.0',
        downloads: 780,
        rating: 4.9,
        modules: ['tech-ledger', 'innovation-ledger', 'data-ledger', 'public-ledger'],
        layout: 'grid',
        tags: ['技术', '开发', '创新', '数据'],
        isPublic: true,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-14',
        icon: <Code className="h-6 w-6" />
      }
    ]
    setTemplates(mockTemplates)
  }, [])

  const categories = [
    { id: 'all', name: '全部应用' },
    { id: 'platform', name: '平台应用' },
    { id: 'ledger', name: '账本系统' },
    { id: 'finance', name: '金融应用' },
    { id: 'creative', name: '创作工具' },
    { id: 'technology', name: '技术开发' }
  ]

  const sortOptions = [
    { id: 'popular', name: '最受欢迎' },
    { id: 'newest', name: '最新发布' },
    { id: 'rating', name: '评分最高' },
    { id: 'downloads', name: '下载最多' }
  ]

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloads - a.downloads
        default:
          return 0
      }
    })

  const handleInstall = (template: AppTemplate) => {
    onInstall?.(template)
    alert(`正在安装应用: ${template.name}`)
  }

  const handlePreview = (template: AppTemplate) => {
    setPreviewTemplate(template)
    onPreview?.(template)
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (previewTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-white/20 hover:bg-white/30"
                >
                  ← 返回市场
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{previewTemplate.name}</h1>
                  <p className="text-purple-100">应用预览模式</p>
                </div>
              </div>
              <Button onClick={() => handleInstall(previewTemplate)}>
                <Download className="h-4 w-4 mr-2" />
                安装应用
              </Button>
            </div>
          </div>
        </div>
        
        <ModularApp
          appId={previewTemplate.id}
          name={previewTemplate.name}
          description={previewTemplate.description}
          layout={previewTemplate.layout}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Code className="h-16 w-16" />
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              应用市场
            </h1>
            <p className="text-xl opacity-90 mb-8">
              发现和安装预构建的模块化应用<br />
              一键部署，快速启动您的专属平台
            </p>
            
            {/* 搜索和筛选 */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索应用、功能或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{templates.length}</div>
              <div className="text-sm text-gray-600">可用应用</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {templates.reduce((sum, t) => sum + t.downloads, 0)}
              </div>
              <div className="text-sm text-gray-600">总下载量</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {templates.filter(t => t.rating >= 4.5).length}
              </div>
              <div className="text-sm text-gray-600">高分应用</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(templates.map(t => t.author)).size}
              </div>
              <div className="text-sm text-gray-600">开发者</div>
            </CardContent>
          </Card>
        </div>

        {/* 应用列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                    {template.icon || <Code className="h-6 w-6" />}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    v{template.version}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* 评分和统计 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      {getRatingStars(template.rating)}
                      <span className="ml-1 text-gray-600">{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Download className="h-4 w-4" />
                      <span>{template.downloads}</span>
                    </div>
                  </div>

                  {/* 作者信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{template.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(template.updatedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>

                  {/* 模块数量 */}
                  <div className="text-sm text-gray-500">
                    包含 {template.modules.length} 个模块
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleInstall(template)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      安装
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到匹配的应用</h3>
            <p className="text-gray-500">尝试调整搜索条件或浏览其他分类</p>
          </div>
        )}
      </div>
    </div>
  )
}