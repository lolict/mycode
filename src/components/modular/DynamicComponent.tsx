'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface ComponentConfig {
  id: string
  name: string
  description: string
  category: string
  icon?: React.ReactNode
  componentPath: string
  props?: Record<string, any>
  status: 'active' | 'developing' | 'planned'
}

interface DynamicComponentProps {
  config: ComponentConfig
  fallback?: React.ReactNode
}

export function DynamicComponent({ config, fallback }: DynamicComponentProps) {
  if (config.status !== 'active') {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.icon}
              <CardTitle className="text-lg">{config.name}</CardTitle>
            </div>
            <Badge variant={config.status === 'developing' ? 'secondary' : 'outline'}>
              {config.status === 'developing' ? '开发中' : '规划中'}
            </Badge>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            {config.status === 'developing' ? '该功能正在开发中' : '该功能正在规划中'}
          </div>
        </CardContent>
      </Card>
    )
  }

  try {
    // 动态导入组件
    const LazyComponent = lazy(() => import(`../${config.componentPath}`))
    
    return (
      <Suspense 
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          )
        }
      >
        <LazyComponent {...config.props} />
      </Suspense>
    )
  } catch (error) {
    console.error(`Failed to load component: ${config.componentPath}`, error)
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            组件加载失败: {config.name}
          </div>
        </CardContent>
      </Card>
    )
  }
}

interface ComponentLibraryProps {
  components: ComponentConfig[]
  category?: string
}

export function ComponentLibrary({ components, category }: ComponentLibraryProps) {
  const filteredComponents = category 
    ? components.filter(comp => comp.category === category)
    : components

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredComponents.map((component) => (
        <DynamicComponent key={component.id} config={component} />
      ))}
    </div>
  )
}