'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface DraggableItem {
  id: string
  name: string
  description: string
  category?: string
  color?: string
}

interface DraggableListProps {
  items: DraggableItem[]
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (id: string) => void
  className?: string
}

export function DraggableList({ items, onReorder, onRemove, className }: DraggableListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < items.length) {
      onReorder(index, newIndex)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="h-12 w-12 mx-auto mb-4 opacity-50">
          <GripVertical />
        </div>
        <p>还没有选择任何模块</p>
        <p className="text-sm">从左侧选择模块开始构建应用</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <Card
          key={item.id}
          className={`transition-all duration-200 ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index ? 'border-blue-400 bg-blue-50' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* 拖拽手柄 */}
              <div className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* 模块信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  {item.category && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* 上移按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>

                {/* 下移按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>

                {/* 删除按钮 */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 拖拽指示器 */}
            {dragOverIndex === index && (
              <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none" />
            )}
          </CardContent>
        </Card>
      ))}

      {/* 拖拽提示 */}
      <div className="text-center text-xs text-gray-500 mt-4">
        💡 拖拽模块可调整顺序，或使用上下箭头移动
      </div>
    </div>
  )
}