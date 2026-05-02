'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SuspenseBoundary } from '@/components/ui/suspense-boundary'
import { usePerformance } from '@/hooks/use-performance'
import { useAccessibility } from '@/hooks/use-accessibility'
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
  Eye,
  Loader2
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

interface EnhancedAppGridProps {
  apps: AppInfo[]
  categories: Array<{ id: string; name: string; icon: React.ReactNode }>
}

// 使用 memo 优化子组件渲染
const AppCard = memo(({ 
  app, 
  viewMode, 
  compact = false,
  onAppClick 
}: { 
  app: AppInfo
  viewMode: 'grid' | 'list' | 'compact'
  compact?: boolean
  onAppClick: (appName: string) => void 
}) => {
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 text-xs" aria-label="应用已上线">已上线</Badge>
      case 'developing':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs" aria-label="应用开发中">开发中</Badge>
      case 'planned':
        return <Badge className="bg-gray-100 text-gray-800 text-xs" aria-label="应用规划中">规划中</Badge>
      default:
        return null
    }
  }, [])

  const handleClick = useCallback(() => {
    onAppClick(app.name)
  }, [app.name, onAppClick])

  if (compact) {
    return (
      <Link 
        key={app.id} 
        href={app.path}
        onClick={handleClick}
        role="article"
        aria-label={`${app.name}: ${app.description}`}
      >
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div 
                className={`p-2 rounded-lg ${app.color} text-white group-hover:scale-110 transition-transform`}
                aria-hidden="true"
              >
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{app.name}</h3>
                  {app.recentlyUsed && <Clock className="h-3 w-3 text-blue-500" aria-label="最近使用" />}
                  {app.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" aria-label="已收藏" />}
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
      <Link 
        key={app.id} 
        href={app.path}
        onClick={handleClick}
        role="article"
        aria-label={`${app.name}: ${app.description}`}
      >
        <Card className="hover:shadow-md transition-shadow cursor-pointer group focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className={`p-4 rounded-lg ${app.color} text-white flex-shrink-0`}
                aria-hidden="true"
              >
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{app.name}</h3>
                  {getStatusBadge(app.status)}
                  {app.recentlyUsed && <Clock className="h-4 w-4 text-blue-500" aria-label="最近使用" />}
                  {app.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="已收藏" />}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="应用特性">
                  {app.features.slice(0, 4).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs" role="listitem">
                      {feature}
                    </Badge>
                  ))}
                  {app.features.length > 4 && (
                    <Badge variant="outline" className="text-xs" role="listitem">
                      +{app.features.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
              <Button className="flex-shrink-0" aria-label={`进入${app.name}应用`}>
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
    <Link 
      key={app.id} 
      href={app.path}
      onClick={handleClick}
      role="article"
      aria-label={`${app.name}: ${app.description}`}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group focus:ring-2 focus:ring-purple-500 focus:outline-none">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div 
              className={`p-3 rounded-lg ${app.color} text-white group-hover:scale-110 transition-transform`}
              aria-hidden="true"
            >
              {app.icon}
            </div>
            <div className="flex items-center gap-1">
              {app.recentlyUsed && <Clock className="h-4 w-4 text-blue-500" aria-label="最近使用" />}
              {app.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="已收藏" />}
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
            <div className="flex flex-wrap gap-1" role="list" aria-label="应用特性">
              {app.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs" role="listitem">
                  {feature}
                </Badge>
              ))}
              {app.features.length > 2 && (
                <Badge variant="outline" className="text-xs" role="listitem">
                  +{app.features.length - 2}
                </Badge>
              )}
            </div>
            
            {app.status === 'active' ? (
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                aria-label={`进入${app.name}应用`}
              >
                进入应用
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : app.status === 'developing' ? (
              <Button disabled className="w-full" aria-label="应用开发中，暂不可用">
                开发中
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full" aria-label="应用规划中，暂不可用">
                规划中
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

AppCard.displayName = 'AppCard'

const AppGroup = memo(({ 
  title, 
  icon, 
  apps, 
  viewMode, 
  compact 
}: { 
  title: string
  icon: React.ReactNode
  apps: AppInfo[]
  viewMode: 'grid' | 'list' | 'compact'
  compact: boolean
  onAppClick: (appName: string) => void
}) => {
  if (apps.length === 0) return null

  return (
    <section aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>
      <h2 
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}
        className="text-lg font-semibold mb-4 flex items-center gap-2"
      >
        {icon}
        {title}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list">
        {apps.map(app => (
          <AppCard 
            key={app.id} 
            app={app} 
            viewMode={viewMode} 
            compact={compact}
            onAppClick={() => {}}
          />
        ))}
      </div>
    </section>
  )
})

AppGroup.displayName = 'AppGroup'

export function EnhancedAppGrid({ apps, categories }: EnhancedAppGridProps) {
  const { measureOperation } = usePerformance('EnhancedAppGrid')
  const { announceToScreenReader, handleKeyboardNavigation } = useAccessibility()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'recently'>('priority')

  // 优化的筛选和排序逻辑
  const filteredAndSortedApps = useMemo(() => {
    return measureOperation(() => {
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
    }, 'filterAndSort')
  }, [apps, selectedCategory, searchQuery, sortBy, measureOperation])

  // 分组显示逻辑
  const groupedApps = useMemo(() => {
    return measureOperation(() => {
      const groups = {
        recent: filteredAndSortedApps.filter(app => app.recentlyUsed),
        favorites: filteredAndSortedApps.filter(app => app.isFavorite),
        active: filteredAndSortedApps.filter(app => app.status === 'active'),
        developing: filteredAndSortedApps.filter(app => app.status === 'developing'),
        planned: filteredAndSortedApps.filter(app => app.status === 'planned')
      }
      return groups
    }, 'groupApps')
  }, [filteredAndSortedApps, measureOperation])

  // 事件处理函数
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    announceToScreenReader(`搜索 ${value}，找到 ${filteredAndSortedApps.length} 个应用`)
  }, [announceToScreenReader, filteredAndSortedApps.length])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    const categoryName = categories.find(c => c.id === categoryId)?.name || '全部'
    announceToScreenReader(`切换到 ${categoryName} 分类`)
  }, [announceToScreenReader, categories])

  const handleAppClick = useCallback((appName: string) => {
    announceToScreenReader(`正在打开 ${appName} 应用`)
  }, [announceToScreenReader])

  // 键盘导航处理
  const handleGridKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    handleKeyboardNavigation(event, {
      onArrowUp: () => {
        // 实现向上导航逻辑
      },
      onArrowDown: () => {
        // 实现向下导航逻辑
      },
      onEnter: () => {
        // 实现回车确认逻辑
      }
    })
  }, [handleKeyboardNavigation])

  return (
    <ErrorBoundary>
      <SuspenseBoundary loadingType="card" loadingCount={3}>
        <div 
          className="space-y-6"
          onKeyDown={(e) => handleGridKeyboardNavigation(e as any)}
          role="main"
          aria-label="应用网格"
        >
          {/* 搜索和筛选栏 */}
          <header className="space-y-4">
            {/* 搜索框 */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
                <Input
                  placeholder="搜索应用、功能或特性..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  aria-label="搜索应用"
                  role="searchbox"
                />
              </div>
            </div>

            {/* 控制栏 */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* 分类筛选 */}
              <nav 
                className="flex flex-wrap gap-2"
                role="navigation"
                aria-label="应用分类"
              >
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category.id)}
                    size="sm"
                    className={selectedCategory === category.id ? "bg-purple-600 hover:bg-purple-700" : "border-purple-300 text-purple-600 hover:bg-purple-50"}
                    aria-pressed={selectedCategory === category.id}
                    aria-label={`筛选${category.name}分类`}
                  >
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </Button>
                ))}
              </nav>

              {/* 视图控制 */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="sr-only">排序方式</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border rounded text-sm"
                  aria-label="排序方式"
                >
                  <option value="priority">智能排序</option>
                  <option value="name">按名称</option>
                  <option value="recently">最近使用</option>
                </select>
                
                <div 
                  className="inline-flex rounded-lg border p-1"
                  role="group"
                  aria-label="视图模式"
                >
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                    aria-pressed={viewMode === 'grid'}
                    aria-label="网格视图"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="px-3"
                    aria-pressed={viewMode === 'list'}
                    aria-label="列表视图"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('compact')}
                    className="px-3"
                    aria-pressed={viewMode === 'compact'}
                    aria-label="紧凑视图"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* 结果统计 */}
          <div className="text-center text-gray-600" role="status" aria-live="polite">
            <p>
              找到 {filteredAndSortedApps.length} 个应用
              {searchQuery && ` · 搜索 "${searchQuery}"`}
              {selectedCategory !== 'all' && ` · ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          </div>

          {/* 分组显示 */}
          {searchQuery === '' && selectedCategory === 'all' && viewMode !== 'list' && (
            <div className="space-y-8">
              <AppGroup
                title="最近使用"
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                apps={groupedApps.recent}
                viewMode={viewMode}
                compact={viewMode === 'compact'}
                onAppClick={handleAppClick}
              />

              <AppGroup
                title="收藏应用"
                icon={<Star className="h-5 w-5 text-yellow-500" />}
                apps={groupedApps.favorites}
                viewMode={viewMode}
                compact={viewMode === 'compact'}
                onAppClick={handleAppClick}
              />

              <AppGroup
                title="已上线应用"
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                apps={groupedApps.active}
                viewMode={viewMode}
                compact={viewMode === 'compact'}
                onAppClick={handleAppClick}
              />

              <AppGroup
                title="开发中应用"
                icon={<Users className="h-5 w-5 text-yellow-500" />}
                apps={groupedApps.developing}
                viewMode={viewMode}
                compact={viewMode === 'compact'}
                onAppClick={handleAppClick}
              />

              <AppGroup
                title="规划中应用"
                icon={<Heart className="h-5 w-5 text-gray-500" />}
                apps={groupedApps.planned}
                viewMode={viewMode}
                compact={viewMode === 'compact'}
                onAppClick={handleAppClick}
              />
            </div>
          )}

          {/* 普通列表视图 */}
          {(searchQuery !== '' || selectedCategory !== 'all' || viewMode === 'list') && (
            <div className={viewMode === 'list' ? 'space-y-4 max-w-4xl mx-auto' : 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
              {filteredAndSortedApps.map(app => (
                <AppCard 
                  key={app.id} 
                  app={app} 
                  viewMode={viewMode} 
                  compact={viewMode === 'compact'}
                  onAppClick={handleAppClick}
                />
              ))}
            </div>
          )}

          {/* 无结果提示 */}
          {filteredAndSortedApps.length === 0 && (
            <div className="text-center py-12" role="alert">
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
                    announceToScreenReader('已清除所有筛选条件')
                  }}
                >
                  清除筛选条件
                </Button>
              )}
            </div>
          )}
        </div>
      </SuspenseBoundary>
    </ErrorBoundary>
  )
}