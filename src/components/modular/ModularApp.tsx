'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DynamicComponent, ComponentLibrary } from './DynamicComponent'
import { useModuleRegistry } from './ModuleRegistry'
import { ArrowRight, Settings, Play, Pause, RotateCcw } from 'lucide-react'

interface ModuleInstance {
  id: string
  moduleId: string
  name: string
  status: 'running' | 'stopped' | 'error'
  config: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface ModularAppProps {
  appId: string
  name: string
  description: string
  layout?: 'grid' | 'flex' | 'tabs'
}

export function ModularApp({ appId, name, description, layout = 'tabs' }: ModularAppProps) {
  const { modules, getModulesByCategory } = useModuleRegistry()
  const [instances, setInstances] = useState<ModuleInstance[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // 初始化默认模块实例
  useEffect(() => {
    const coreModules = getModulesByCategory('core')
    const defaultInstances: ModuleInstance[] = coreModules.map((module, index) => ({
      id: `${appId}-${module.id}`,
      moduleId: module.id,
      name: module.name,
      status: 'running' as const,
      config: module.config || {},
      position: { x: index * 320, y: 0 },
      size: { width: 300, height: 400 }
    }))
    setInstances(defaultInstances)
  }, [appId, getModulesByCategory])

  const startInstance = (instanceId: string) => {
    setInstances(prev => prev.map(instance => 
      instance.id === instanceId 
        ? { ...instance, status: 'running' }
        : instance
    ))
  }

  const stopInstance = (instanceId: string) => {
    setInstances(prev => prev.map(instance => 
      instance.id === instanceId 
        ? { ...instance, status: 'stopped' }
        : instance
    ))
  }

  const restartInstance = (instanceId: string) => {
    setInstances(prev => prev.map(instance => 
      instance.id === instanceId 
        ? { ...instance, status: 'running' }
        : instance
    ))
  }

  const getInstanceStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">运行中</Badge>
      case 'stopped':
        return <Badge className="bg-red-100 text-red-800">已停止</Badge>
      case 'error':
        return <Badge className="bg-yellow-100 text-yellow-800">错误</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderOverview = () => (
    <div className="space-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {instances.filter(i => i.status === 'running').length}
                </div>
                <div className="text-sm text-gray-600">运行中</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {instances.filter(i => i.status === 'stopped').length}
                </div>
                <div className="text-sm text-gray-600">已停止</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{instances.length}</div>
                <div className="text-sm text-gray-600">总模块</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{modules.size}</div>
                <div className="text-sm text-gray-600">可用模块</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>模块实例管理</CardTitle>
          <CardDescription>管理应用中的模块实例，启动、停止或重启模块</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instances.map((instance) => {
              const module = modules.get(instance.moduleId)
              return (
                <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded">
                      {module?.config?.icon || <Settings className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{instance.name}</div>
                      <div className="text-sm text-gray-600">{module?.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getInstanceStatusBadge(instance.status)}
                    <div className="flex gap-1">
                      {instance.status === 'running' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => stopInstance(instance.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startInstance(instance.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => restartInstance(instance.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderModules = () => (
    <div className="space-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instances.map((instance) => {
          if (instance.status !== 'running') return null
          
          const module = modules.get(instance.moduleId)
          if (!module) return null

          return (
            <Card key={instance.id} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{instance.name}</CardTitle>
                  {getInstanceStatusBadge(instance.status)}
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] flex items-center justify-center text-gray-500">
                  模块内容区域
                  <br />
                  <span className="text-sm">({module.version})</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-6">
      <Card>
        <CardHeader>
          <CardTitle>应用设置</CardTitle>
          <CardDescription>配置模块化应用的各种参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">应用信息</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">应用ID:</span>
                <span>{appId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">应用名称:</span>
                <span>{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">布局模式:</span>
                <span>{layout}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">模块配置</h4>
            <div className="space-y-2">
              {instances.map((instance) => {
                const module = modules.get(instance.moduleId)
                return (
                  <div key={instance.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{instance.name}</span>
                      {getInstanceStatusBadge(instance.status)}
                    </div>
                    <div className="text-sm text-gray-600">{module?.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-purple-100">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="modules">模块</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="modules" className="mt-6">
            {renderModules()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}