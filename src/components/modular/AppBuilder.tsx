'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useModuleRegistry } from './ModuleRegistry'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Plus, Trash2, Settings, Play, Save, Eye } from 'lucide-react'

interface AppTemplate {
  id: string
  name: string
  description: string
  modules: string[]
  layout: 'grid' | 'flex' | 'tabs'
  config: Record<string, any>
  isPublic: boolean
}

interface AppBuilderProps {
  onSave?: (template: AppTemplate) => void
  onPreview?: (template: AppTemplate) => void
}

export function AppBuilder({ onSave, onPreview }: AppBuilderProps) {
  const { modules } = useModuleRegistry()
  const [template, setTemplate] = useState<AppTemplate>({
    id: '',
    name: '',
    description: '',
    modules: [],
    layout: 'tabs',
    config: {},
    isPublic: false
  })
  const [selectedCategory, setSelectedCategory] = useState('all')

  const availableModules = Array.from(modules.values())
  const filteredModules = selectedCategory === 'all' 
    ? availableModules 
    : availableModules.filter(module => module.category === selectedCategory)

  const categories = [
    { id: 'all', name: '全部模块' },
    { id: 'core', name: '核心模块' },
    { id: 'ledger', name: '账本模块' },
    { id: 'community', name: '共同体模块' },
    { id: 'infrastructure', name: '基础设施' }
  ]

  const addModule = (moduleId: string) => {
    if (!template.modules.includes(moduleId)) {
      setTemplate(prev => ({
        ...prev,
        modules: [...prev.modules, moduleId]
      }))
    }
  }

  const removeModule = (moduleId: string) => {
    setTemplate(prev => ({
      ...prev,
      modules: prev.modules.filter(id => id !== moduleId)
    }))
  }

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return

    const items = Array.from(template.modules)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTemplate(prev => ({
      ...prev,
      modules: items
    }))
  }, [template.modules])

  const handleSave = () => {
    if (!template.name || !template.description) {
      alert('请填写应用名称和描述')
      return
    }

    if (template.modules.length === 0) {
      alert('请至少添加一个模块')
      return
    }

    const savedTemplate = {
      ...template,
      id: template.id || `app-${Date.now()}`
    }

    onSave?.(savedTemplate)
    alert('应用模板保存成功！')
  }

  const handlePreview = () => {
    if (template.modules.length === 0) {
      alert('请至少添加一个模块')
      return
    }

    onPreview?.(template)
  }

  const getModuleById = (moduleId: string) => {
    return modules.get(moduleId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">模块化应用构建器</h1>
              <p className="text-blue-100">拖拽组装，快速构建您的专属应用</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：应用配置 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>应用配置</CardTitle>
                <CardDescription>设置应用的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="appName">应用名称 *</Label>
                  <Input
                    id="appName"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入应用名称"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appDescription">应用描述 *</Label>
                  <Textarea
                    id="appDescription"
                    value={template.description}
                    onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述应用的功能和用途"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="layout">布局模式</Label>
                  <Select value={template.layout} onValueChange={(value: any) => setTemplate(prev => ({ ...prev, layout: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabs">标签页布局</SelectItem>
                      <SelectItem value="grid">网格布局</SelectItem>
                      <SelectItem value="flex">弹性布局</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    保存模板
                  </Button>
                  <Button onClick={handlePreview} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    预览
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>模块分类</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间：可用模块 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>可用模块</CardTitle>
                <CardDescription>选择要添加到应用中的模块</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredModules.map((module) => (
                    <div key={module.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{module.name}</div>
                          <div className="text-sm text-gray-600">{module.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {module.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              v{module.version}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addModule(module.id)}
                          disabled={template.modules.includes(module.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：已选模块 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>已选模块 ({template.modules.length})</CardTitle>
                <CardDescription>拖拽调整模块顺序</CardDescription>
              </CardHeader>
              <CardContent>
                {template.modules.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>还没有选择任何模块</p>
                    <p className="text-sm">从左侧选择模块开始构建应用</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="modules">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {template.modules.map((moduleId, index) => {
                            const module = getModuleById(moduleId)
                            if (!module) return null

                            return (
                              <Draggable key={moduleId} draggableId={moduleId} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 border rounded-lg bg-white ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium">{module.name}</div>
                                        <div className="text-sm text-gray-600">{module.description}</div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeModule(moduleId)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>

            {template.modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>应用预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{template.name || '未命名应用'}</div>
                      <div className="text-sm text-gray-600">{template.description || '暂无描述'}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      包含 {template.modules.length} 个模块
                    </div>
                    <Button onClick={handlePreview} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      启动预览
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}