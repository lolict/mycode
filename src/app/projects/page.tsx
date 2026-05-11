'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Heart, Users, Calendar, MapPin, AlertCircle, Loader2, Search, ArrowLeft } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  status: string
  endDate: string
  location?: string
  category?: {
    name: string
  }
  donorCount: number
}

export default function SimpleProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/projects?limit=50')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
      
    } catch (err) {
      console.error('加载项目失败:', err)
      setError(err instanceof Error ? err.message : '加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">正在加载项目...</p>
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
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
              <h1 className="text-xl font-semibold">助残项目列表</h1>
            </div>
            <Button 
              size="sm" 
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => window.location.href = '/create'}
            >
              发起项目
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadProjects}>
                重试
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <p className="text-gray-500 text-lg mb-4">没有找到匹配的项目</p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  清除搜索
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg mb-4">暂无项目</p>
                <Button 
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => window.location.href = '/create'}
                >
                  发起第一个项目
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                找到 {filteredProjects.length} 个项目
                {searchTerm && ` (搜索: "${searchTerm}")`}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
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
                      onClick={() => window.location.href = `/project/${project.id}`}
                    >
                      查看详情
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}