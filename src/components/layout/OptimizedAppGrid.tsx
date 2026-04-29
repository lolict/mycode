'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowRight, 
  Star, 
  Clock, 
  TrendingUp, 
  Grid3X3, 
  BookOpen,
  Heart,
  Users,
  Search,
  Filter,
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

interface OptimizedAppGridProps {
  apps: AppInfo[]
  categories: Array<{ id: string; name: string; icon: React.ReactNode }>
}

export function OptimizedAppGrid({ apps, categories }: OptimizedAppGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'recently'>('priority')

  // 智能筛选和排序
  const filteredAndSortedApps = useMemo(() => {
    let filtered = apps.filter(app => {
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
      const matchesSearch = searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })

    // 智能排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          // 优先级排序：已上线 > 最近使用 > 收藏 > 其他
          if (a.status === 'active' && b.status !== 'active') return -1
          if (a.status !== 'active' && b.status === 'active') return 1
          if (a.recentlyUsed && !b.recentlyUsed) return -1
          if (!a.recentlyUsed && b.recentlyUsed) return 1
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1
          return (a.priority || 0) - (b.priority || 0)
        
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        
        case 'recently':
          if (a.recentlyUsed && !b.recentlyUsed) return -1
          if (!a.recentlyUsed && b.recentlyUsed) return 1
          return 0
        
        default:
          return 0
      }
    })

    return filtered
  }, [apps, selectedCategory, searchQuery, sortBy])

  // 分组显示
  const groupedApps = useMemo(() => {
    const groups = {
      recent: filteredAndSortedApps.filter(app => app.recentlyUsed),
      favorites: filteredAndSortedApps.filter(app => app.isFavorite),
      active: filteredAndSortedApps.filter(app => app.status === 'active'),
      developing: filteredAndSortedApps.filter(app => app.status === 'developing'),
      planned: filteredAndSortedApps.filter(app => app.status === 'planned')
    }
    return groups
  }, [filteredAndSortedApps])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 text-xs">已上线</Badge>
      case 'developing':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">开发中</Badge>
      case 'planned':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">规划中</Badge>
      default:
        return null
    }
  }

  const renderAppCard = (app: AppInfo, compact = false) => {
    if (compact) {
      return (
        <Link key={app.id} href={app.path}>
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${app.color} text-white group-hover:scale-110 transition-transform`}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{app.name}</h3>
                    {app.recentlyUsed && <Clock className="h-3 w-3 text-blue-500" />}
                    {app.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">{app.description}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>
            </CardContent>
          </Card>
        </Link>
      )
    }

    if (viewMode === 'list') {
      return (
        <Link key={app.id} href={app.path}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-lg ${app.color} text-white flex-shrink-0`}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{app.name}</h3>
                    {getStatusBadge(app.status)}
                    {app.recentlyUsed && <Clock className="h-4 w-4 text-blue-500" />}
                    {app.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {app.features.slice(0, 4).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {app.features.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{app.features.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button className="flex-shrink-0">
                  进入应用
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      )
    }

    return (
      <Link key={app.id} href={app.path}>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${app.color} text-white group-hover:scale-110 transition-transform`}>
                {app.icon}
              </div>
              <div className="flex items-center gap-1">
                {app.recentlyUsed && <Clock className="h-4 w-4 text-blue-500" />}
                {app.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                {getStatusBadge(app.status)}
              </div>
            </div>
            <CardTitle className="text-lg">{app.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {app.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {app.features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {app.features.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{app.features.length - 2}
                  </Badge>
                )}
              </div>
              
              {app.status === 'active' ? (
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  进入应用
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : app.status === 'developing' ? (
                <Button disabled className="w-full">
                  开发中
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  规划中
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索应用、功能或特性..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 控制栏 */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className={selectedCategory === category.id ? "bg-purple-600 hover:bg-purple-700" : "border-purple-300 text-purple-600 hover:bg-purple-50"}
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* 视图控制 */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="priority">智能排序</option>
              <option value="name">按名称</option>
              <option value="recently">最近使用</option>
            </select>
            
            <div className="inline-flex rounded-lg border p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                onClick={() => setViewMode('compact')}
                className="px-3"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="text-center text-gray-600">
        <p>
          找到 {filteredAndSortedApps.length} 个应用
          {searchQuery && ` · 搜索 "${searchQuery}"`}
          {selectedCategory !== 'all' && ` · ${categories.find(c => c.id === selectedCategory)?.name}`}
        </p>
      </div>

      {/* 分组显示 */}
      {searchQuery === '' && selectedCategory === 'all' && viewMode !== 'list' && (
        <div className="space-y-8">
          {/* 最近使用 */}
          {groupedApps.recent.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                最近使用
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedApps.recent.map(app => renderAppCard(app, viewMode === 'compact'))}
              </div>
            </div>
          )}

          {/* 收藏应用 */}
          {groupedApps.favorites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                收藏应用
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedApps.favorites.map(app => renderAppCard(app, viewMode === 'compact'))}
              </div>
            </div>
          )}

          {/* 已上线应用 */}
          {groupedApps.active.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                已上线应用
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedApps.active.map(app => renderAppCard(app, viewMode === 'compact'))}
              </div>
            </div>
          )}

          {/* 开发中应用 */}
          {groupedApps.developing.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-500" />
                开发中应用
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedApps.developing.map(app => renderAppCard(app, viewMode === 'compact'))}
              </div>
            </div>
          )}

          {/* 规划中应用 */}
          {groupedApps.planned.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-gray-500" />
                规划中应用
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedApps.planned.map(app => renderAppCard(app, viewMode === 'compact'))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 普通列表视图 */}
      {(searchQuery !== '' || selectedCategory !== 'all' || viewMode === 'list') && (
        <div className={viewMode === 'list' ? 'space-y-4 max-w-4xl mx-auto' : 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
          {filteredAndSortedApps.map(app => renderAppCard(app, viewMode === 'compact'))}
        </div>
      )}

      {/* 无结果提示 */}
      {filteredAndSortedApps.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到匹配的应用</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? '尝试调整搜索关键词' : '尝试选择其他分类'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              清除筛选条件
            </Button>
          )}
        </div>
      )}
    </div>
  )
}