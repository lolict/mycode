'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Heart, Users, Calendar, MapPin, AlertCircle, Loader2, PlusCircle, Target, TrendingUp, UserCheck } from 'lucide-react'
import { stableAPI, Project, Stats } from '@/lib/stable-api'
import StableCrowdfundingPlatform from '@/components/StableCrowdfundingPlatform'

export default function StableHomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useStableMode, setUseStableMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 并行加载项目和统计数据
      const [projectsData, statsData] = await Promise.all([
        stableAPI.getProjects({ featured: true, limit: 6 }),
        stableAPI.getStats()
      ])
      
      setProjects(projectsData.projects || [])
      setStats(statsData)
    } catch (err) {
      console.error('加载数据失败:', err)
      setError(err instanceof Error ? err.message : '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  // 如果用户选择稳定模式或发生错误，使用稳定组件
  if (useStableMode || error) {
    return (
      <div>
        {error && (
          <div className="sticky top-0 z-50 bg-red-50 border-b border-red-200">
            <div className="container mx-auto px-4 py-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setError(null)
                      setUseStableMode(false)
                      loadData()
                    }}
                  >
                    重试
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
        <StableCrowdfundingPlatform />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">圆聚助残平台</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUseStableMode(true)}
                className="border-pink-500 text-pink-600 hover:bg-pink-50"
              >
                稳定模式
              </Button>
              <Button 
                size="sm" 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => setUseStableMode(true)}
              >
                发起项目
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Heart className="relative h-16 w-16 text-pink-200 fill-pink-200 transform group-hover:scale-110 transition-transform" />
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              圆聚助残
              <span className="block text-2xl sm:text-3xl md:text-3xl text-pink-100 mt-2 font-normal">
                供残捐 · 益企捐 - 新天枰倾斜公益平台
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-pink-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              专注解决农村残疾人和残疾人关键困境，各尽其能、物尽其用、人尽其力
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-pink-600 hover:bg-gray-100 px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                onClick={() => setUseStableMode(true)}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                发起助残项目
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-pink-600 px-8 transition-colors"
                onClick={() => setUseStableMode(true)}
              >
                浏览项目
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 mx-auto mb-3 text-pink-500" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                  <div className="text-sm text-gray-600">联建项目</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <div className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmount)}</div>
                  <div className="text-sm text-gray-600">众筹资金</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <UserCheck className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalDonors}</div>
                  <div className="text-sm text-gray-600">帮扶人士</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600">成功率</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Featured Projects */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">重点助残项目</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              聚焦农村残疾人就业、医疗、教育、基础设施等关键困境
            </p>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">暂无推荐项目</p>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => setUseStableMode(true)}
              >
                发起第一个项目
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 transition-colors">
                          {project.category?.name || '联建项目'}
                        </Badge>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getProgressPercentage(project.currentAmount, project.targetAmount).toFixed(0)}%
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-600">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Progress value={getProgressPercentage(project.currentAmount, project.targetAmount)} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">已筹集</span>
                          <span className="font-semibold text-pink-600">
                            {formatAmount(project.currentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">目标金额</span>
                          <span className="font-medium">{formatAmount(project.targetAmount)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{project.donorCount} 位支持者</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(project.endDate)}</span>
                          </div>
                        </div>
                        
                        {project.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{project.location}</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => setUseStableMode(true)}
                      >
                        参与联建
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-pink-500 text-pink-600 hover:bg-pink-50 hover:border-pink-600 transition-colors"
                  onClick={() => setUseStableMode(true)}
                >
                  查看更多联建项目
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              新天枰倾斜，残健共同体
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              健全人通过帮扶农村残疾人获得未来股权投资机会，共建残健庇护信托智能合约系统
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 max-w-2xl mx-auto border border-white/20">
              <h3 className="text-xl font-semibold mb-4">平台发起人</h3>
              <div className="text-lg mb-2">
                <strong>莫姓成年</strong> (共同体循一&妙录兰灵)
              </div>
              <p className="text-sm mb-2">名伶姑爷 · 圆聚助残平台创始人</p>
              <p className="text-sm mb-4">
                联系方式：lolict@outlook.com | 网站：blog1.wodemo.net
              </p>
              <div className="text-sm space-y-1">
                <p>致力于农村残疾人联合办公大楼建设，</p>
                <p>构建残健共同体账户庇护系统，</p>
                <p>实现新天枰倾斜的公益理念。</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-pink-600 hover:bg-gray-100 px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              onClick={() => setUseStableMode(true)}
            >
              发起联建项目
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}