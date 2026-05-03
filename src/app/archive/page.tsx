'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Archive, Search, PlusCircle, Layers, Network, Grid3X3,
  ChevronRight, X, Loader2, Tag, ArrowRight, Link2,
  Sparkles, Shield, Server, Code, BookOpen, AlertCircle,
  RefreshCw, Trash2, Eye, ArrowDown, ArrowUpRight, GitBranch
} from 'lucide-react'

// ====== 类型定义 ======

interface ArchiveCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  layer: string
  sortOrder: number
  parentCategoryId: string | null
  childCategories?: ArchiveCategory[]
  _count?: { archives: number }
}

interface ArchiveRelation {
  id: string
  fromId: string
  toId: string
  relationType: string
  distance: number
  description: string | null
  from: { id: string; title: string; layer: string; status?: string }
  to: { id: string; title: string; layer: string; status?: string }
}

interface CreativeArchive {
  id: string
  title: string
  content: string
  summary: string | null
  categoryId: string | null
  layer: string
  status: string
  priority: number
  completion: number
  featureVector: string | null
  tags: string | null
  source: string | null
  version: string
  authorId: string | null
  category: ArchiveCategory | null
  outgoingRelations: ArchiveRelation[]
  incomingRelations: ArchiveRelation[]
  createdAt: string
  updatedAt: string
}

interface ArchiveStats {
  total: number
  byLayer: Record<string, number>
  byStatus: Record<string, number>
}

// ====== 工具函数 ======

const LAYER_CONFIG: Record<string, { label: string; icon: string; color: string; bgClass: string; borderClass: string; textClass: string }> = {
  philosophy: { label: '哲学层', icon: '🔴', color: '#ef4444', bgClass: 'bg-red-900/30', borderClass: 'border-red-700', textClass: 'text-red-400' },
  foundation: { label: '底层', icon: '🟠', color: '#f97316', bgClass: 'bg-orange-900/30', borderClass: 'border-orange-700', textClass: 'text-orange-400' },
  architecture: { label: '架构层', icon: '🟡', color: '#eab308', bgClass: 'bg-yellow-900/30', borderClass: 'border-yellow-700', textClass: 'text-yellow-400' },
  application: { label: '应用层', icon: '🟢', color: '#22c55e', bgClass: 'bg-green-900/30', borderClass: 'border-green-700', textClass: 'text-green-400' }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  draft: { label: '草稿', color: 'slate', bgClass: 'bg-slate-600' },
  developing: { label: '开发中', color: 'blue', bgClass: 'bg-blue-600' },
  implemented: { label: '已实现', color: 'green', bgClass: 'bg-green-600' },
  deferred: { label: '搁置', color: 'amber', bgClass: 'bg-amber-600' },
  deprecated: { label: '废弃', color: 'red', bgClass: 'bg-red-600' }
}

const RELATION_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  dependency: { label: '依赖', color: '#3b82f6', icon: '→' },
  'parent-child': { label: '父子', color: '#8b5cf6', icon: '↓' },
  related: { label: '关联', color: '#6b7280', icon: '—' },
  contradiction: { label: '矛盾', color: '#ef4444', icon: '✕' },
  fusion: { label: '融合', color: '#10b981', icon: '⊕' },
  prerequisite: { label: '前置', color: '#f59e0b', icon: '⇢' }
}

function getLayerConfig(layer: string) {
  return LAYER_CONFIG[layer] || LAYER_CONFIG.application
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.draft
}

function getRelationConfig(relationType: string) {
  return RELATION_TYPE_CONFIG[relationType] || RELATION_TYPE_CONFIG.related
}

function parseJSON<T>(jsonStr: string | null): T | null {
  if (!jsonStr) return null
  try { return JSON.parse(jsonStr) } catch { return null }
}

// ====== 归档详情弹窗 ======

function ArchiveDetailModal({ archive, onClose }: { archive: CreativeArchive; onClose: () => void }) {
  const layerConf = getLayerConfig(archive.layer)
  const statusConf = getStatusConfig(archive.status)
  const tags = parseJSON<string[]>(archive.tags)
  const featureVector = parseJSON<Record<string, number>>(archive.featureVector)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{layerConf.icon}</span>
              <div>
                <CardTitle className="text-white">{archive.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${layerConf.bgClass} ${layerConf.textClass} border-0 text-xs`}>{layerConf.label}</Badge>
                  <Badge className={`${statusConf.bgClass} text-white text-xs`}>{statusConf.label}</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">v{archive.version}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {archive.summary && (
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 italic">{archive.summary}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-slate-300 mb-2">详细内容</h4>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{archive.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">优先级</h4>
              <div className="flex items-center gap-2">
                <Progress value={archive.priority} className="flex-1 h-2" />
                <span className="text-sm text-slate-400">{archive.priority}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">完成度</h4>
              <div className="flex items-center gap-2">
                <Progress value={archive.completion} className="flex-1 h-2" />
                <span className="text-sm text-slate-400">{archive.completion}%</span>
              </div>
            </div>
          </div>

          {featureVector && (
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">特征向量</h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(featureVector).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500">{key}</div>
                    <div className="text-sm font-semibold text-slate-300">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tags && tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">标签</h4>
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    <Tag className="h-3 w-3 mr-1" />{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 关系 */}
          {(archive.outgoingRelations.length > 0 || archive.incomingRelations.length > 0) && (
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">关系网络</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {archive.outgoingRelations.map(rel => {
                  const relConf = getRelationConfig(rel.relationType)
                  return (
                    <div key={rel.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded text-sm">
                      <Badge className="text-xs border-0" style={{ backgroundColor: relConf.color + '40', color: relConf.color }}>
                        {relConf.icon} {relConf.label}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-slate-500" />
                      <span className="text-slate-300">{rel.to.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">距离: {rel.distance}</span>
                    </div>
                  )
                })}
                {archive.incomingRelations.map(rel => {
                  const relConf = getRelationConfig(rel.relationType)
                  return (
                    <div key={rel.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded text-sm">
                      <span className="text-slate-300">{rel.from.title}</span>
                      <ChevronRight className="h-3 w-3 text-slate-500" />
                      <Badge className="text-xs border-0" style={{ backgroundColor: relConf.color + '40', color: relConf.color }}>
                        {relConf.icon} {relConf.label}
                      </Badge>
                      <span className="text-slate-400">→ 本项</span>
                      <span className="text-xs text-slate-500 ml-auto">距离: {rel.distance}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {archive.source && (
            <div className="text-xs text-slate-500">
              来源: {archive.source}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ====== 归档卡片 ======

function ArchiveCard({ archive, onClick }: { archive: CreativeArchive; onClick: () => void }) {
  const layerConf = getLayerConfig(archive.layer)
  const statusConf = getStatusConfig(archive.status)
  const tags = parseJSON<string[]>(archive.tags)

  return (
    <Card
      className="bg-slate-800/80 border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-900/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{layerConf.icon}</span>
            <h3 className="font-semibold text-white text-sm line-clamp-1">{archive.title}</h3>
          </div>
          <Badge className={`${statusConf.bgClass} text-white text-[10px] shrink-0`}>{statusConf.label}</Badge>
        </div>

        {archive.summary && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{archive.summary}</p>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[10px] text-slate-500 w-8">完成</span>
            <Progress value={archive.completion} className="flex-1 h-1.5" />
            <span className="text-[10px] text-slate-500 w-7">{archive.completion}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${layerConf.bgClass} ${layerConf.textClass} border-0 text-[10px]`}>{layerConf.label}</Badge>
          {tags && tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="border-slate-700 text-slate-500 text-[10px]">
              {tag}
            </Badge>
          ))}
          {(archive.outgoingRelations.length + archive.incomingRelations.length) > 0 && (
            <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px] ml-auto">
              <Link2 className="h-3 w-3 mr-1" />
              {archive.outgoingRelations.length + archive.incomingRelations.length}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ====== 思维图谱 SVG 可视化 ======

function ThoughtGraph({ archives, relations }: { archives: CreativeArchive[]; relations: ArchiveRelation[] }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // 简单的力导向布局
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const layerGroups: Record<string, CreativeArchive[]> = {
      philosophy: [],
      foundation: [],
      architecture: [],
      application: []
    }

    archives.forEach(a => {
      if (layerGroups[a.layer]) {
        layerGroups[a.layer].push(a)
      }
    })

    const layerY: Record<string, number> = {
      philosophy: 80,
      foundation: 220,
      architecture: 360,
      application: 500
    }

    Object.entries(layerGroups).forEach(([layer, items]) => {
      const totalWidth = items.length * 120
      const startX = Math.max(50, 500 - totalWidth / 2)
      items.forEach((item, i) => {
        positions[item.id] = {
          x: startX + i * 120 + 50,
          y: layerY[layer] + (i % 2 === 0 ? 0 : 30)
        }
      })
    })

    return positions
  }, [archives])

  const highlightedNodes = useMemo(() => {
    if (!selectedNode && !hoveredNode) return new Set<string>()
    const targetId = selectedNode || hoveredNode
    const set = new Set<string>()
    if (!targetId) return set
    set.add(targetId)
    relations.forEach(r => {
      if (r.fromId === targetId) set.add(r.toId)
      if (r.toId === targetId) set.add(r.fromId)
    })
    return set
  }, [selectedNode, hoveredNode, relations])

  const selectedArchive = selectedNode ? archives.find(a => a.id === selectedNode) : null

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-auto">
        <svg width="1000" height="580" viewBox="0 0 1000 580" className="min-w-[800px]">
          {/* 层级背景 */}
          {Object.entries(LAYER_CONFIG).map(([layer, conf]) => (
            <g key={layer}>
              <rect
                x={10}
                y={layer === 'philosophy' ? 10 : layer === 'foundation' ? 150 : layer === 'architecture' ? 290 : 430}
                width={980}
                height={130}
                rx={8}
                fill={conf.color}
                fillOpacity={0.05}
                stroke={conf.color}
                strokeOpacity={0.2}
                strokeWidth={1}
              />
              <text
                x={25}
                y={layer === 'philosophy' ? 30 : layer === 'foundation' ? 170 : layer === 'architecture' ? 310 : 450}
                fill={conf.color}
                fontSize={12}
                fontWeight="bold"
              >
                {conf.icon} {conf.label}
              </text>
            </g>
          ))}

          {/* 关系连线 */}
          {relations.map(rel => {
            const from = nodePositions[rel.fromId]
            const to = nodePositions[rel.toId]
            if (!from || !to) return null
            const relConf = getRelationConfig(rel.relationType)
            const isHighlighted = highlightedNodes.has(rel.fromId) && highlightedNodes.has(rel.toId)
            const opacity = highlightedNodes.size > 0 ? (isHighlighted ? 0.8 : 0.1) : 0.4
            const strokeWidth = Math.max(1, 4 - rel.distance / 25)

            return (
              <g key={rel.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={relConf.color}
                  strokeOpacity={opacity}
                  strokeWidth={strokeWidth}
                  strokeDasharray={rel.relationType === 'contradiction' ? '5,5' : rel.relationType === 'related' ? '3,3' : 'none'}
                />
                {isHighlighted && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 5}
                    fill={relConf.color}
                    fontSize={9}
                    textAnchor="middle"
                  >
                    {relConf.icon} {relConf.label} (d={rel.distance})
                  </text>
                )}
              </g>
            )
          })}

          {/* 节点 */}
          {archives.map(archive => {
            const pos = nodePositions[archive.id]
            if (!pos) return null
            const layerConf = getLayerConfig(archive.layer)
            const isSelected = selectedNode === archive.id
            const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(archive.id)
            const opacity = highlightedNodes.size > 0 && !isHighlighted ? 0.3 : 1

            return (
              <g
                key={archive.id}
                onClick={() => setSelectedNode(isSelected ? null : archive.id)}
                onMouseEnter={() => setHoveredNode(archive.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
                opacity={opacity}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 22 : 18}
                  fill={layerConf.color}
                  fillOpacity={isSelected ? 0.4 : 0.2}
                  stroke={layerConf.color}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y - 2}
                  fill="white"
                  fontSize={isSelected ? 11 : 9}
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {archive.title.length > 5 ? archive.title.substring(0, 5) + '..' : archive.title}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  fill={layerConf.color}
                  fontSize={7}
                  textAnchor="middle"
                >
                  {archive.completion}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <span className="text-xs text-slate-400">关系类型：</span>
        {Object.entries(RELATION_TYPE_CONFIG).map(([type, conf]) => (
          <div key={type} className="flex items-center gap-1 text-xs">
            <span style={{ color: conf.color }}>{conf.icon}</span>
            <span className="text-slate-400">{conf.label}</span>
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-4">点击节点查看详情，线粗=距离近</span>
      </div>

      {/* 选中节点详情 */}
      {selectedArchive && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLayerConfig(selectedArchive.layer).icon}</span>
                <h3 className="font-semibold">{selectedArchive.title}</h3>
                <Badge className={`${getStatusConfig(selectedArchive.status).bgClass} text-white text-xs`}>
                  {getStatusConfig(selectedArchive.status).label}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-slate-400 mb-2">{selectedArchive.summary || selectedArchive.content.substring(0, 100)}</p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>优先级: {selectedArchive.priority}</span>
              <span>完成度: {selectedArchive.completion}%</span>
              <span>关系: {selectedArchive.outgoingRelations.length + selectedArchive.incomingRelations.length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ====== 距离矩阵 ======

function DistanceMatrix({ archives, relations }: { archives: CreativeArchive[]; relations: ArchiveRelation[] }) {
  const [filterType, setFilterType] = useState<string>('all')

  const filteredRelations = filterType === 'all' ? relations : relations.filter(r => r.relationType === filterType)

  const getDistanceColor = (distance: number) => {
    if (distance <= 15) return 'bg-green-600 text-white'
    if (distance <= 30) return 'bg-green-500/70 text-white'
    if (distance <= 50) return 'bg-yellow-500/70 text-black'
    if (distance <= 70) return 'bg-orange-500/70 text-white'
    return 'bg-red-500/70 text-white'
  }

  return (
    <div className="space-y-4">
      {/* 关系类型过滤 */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filterType === 'all' ? 'default' : 'outline'}
          className={filterType === 'all' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'border-slate-600 text-slate-300'}
          onClick={() => setFilterType('all')}
        >
          全部
        </Button>
        {Object.entries(RELATION_TYPE_CONFIG).map(([type, conf]) => (
          <Button
            key={type}
            size="sm"
            variant={filterType === type ? 'default' : 'outline'}
            className={filterType === type ? 'text-white' : 'border-slate-600 text-slate-300'}
            style={filterType === type ? { backgroundColor: conf.color } : {}}
            onClick={() => setFilterType(type)}
          >
            {conf.icon} {conf.label}
          </Button>
        ))}
      </div>

      {/* 关系列表 */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 p-3 border-b border-slate-700 text-xs text-slate-500 font-semibold">
          <div className="col-span-3">源创意</div>
          <div className="col-span-2 text-center">关系</div>
          <div className="col-span-3">目标创意</div>
          <div className="col-span-2 text-center">距离</div>
          <div className="col-span-2">说明</div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredRelations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">暂无关系数据，请先归档种子数据</div>
          ) : (
            filteredRelations.map(rel => {
              const relConf = getRelationConfig(rel.relationType)
              return (
                <div key={rel.id} className="grid grid-cols-12 gap-0 p-3 border-b border-slate-700/50 hover:bg-slate-700/30 text-sm">
                  <div className="col-span-3 flex items-center gap-1">
                    <span className="text-xs">{getLayerConfig(rel.from.layer).icon}</span>
                    <span className="text-slate-300 truncate">{rel.from.title}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <Badge className="text-[10px] border-0" style={{ backgroundColor: relConf.color + '30', color: relConf.color }}>
                      {relConf.icon} {relConf.label}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <span className="text-xs">{getLayerConfig(rel.to.layer).icon}</span>
                    <span className="text-slate-300 truncate">{rel.to.title}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <Badge className={`${getDistanceColor(rel.distance)} text-[10px]`}>
                      {rel.distance}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 truncate">{rel.description || '-'}</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 距离说明 */}
      <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <span className="text-xs text-slate-400">距离说明：</span>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white text-[10px]">0-15 紧密</Badge>
          <Badge className="bg-green-500/70 text-white text-[10px]">16-30 相关</Badge>
          <Badge className="bg-yellow-500/70 text-black text-[10px]">31-50 中等</Badge>
          <Badge className="bg-orange-500/70 text-white text-[10px]">51-70 疏远</Badge>
          <Badge className="bg-red-500/70 text-white text-[10px]">71+ 无关</Badge>
        </div>
      </div>
    </div>
  )
}

// ====== 新增创意表单 ======

function AddArchiveForm({ archives, onCreated }: { archives: CreativeArchive[]; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    summary: '',
    layer: 'application',
    status: 'draft',
    priority: 50,
    completion: 0,
    tags: '',
    source: ''
  })
  const [relations, setRelations] = useState<Array<{ toId: string; relationType: string; distance: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      setError('标题和内容为必填项')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const tagsArr = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: tagsArr,
          featureVector: null
        })
      })
      const data = await res.json()
      if (res.ok && data.archive) {
        // 创建关联关系
        for (const rel of relations) {
          await fetch('/api/archive/relations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromId: data.archive.id,
              toId: rel.toId,
              relationType: rel.relationType,
              distance: rel.distance
            })
          })
        }
        setSuccess(true)
        setForm({ title: '', content: '', summary: '', layer: 'application', status: 'draft', priority: 50, completion: 0, tags: '', source: '' })
        setRelations([])
        onCreated()
      } else {
        setError(data.error || '创建失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const addRelation = () => {
    setRelations(prev => [...prev, { toId: '', relationType: 'related', distance: 50 }])
  }

  const removeRelation = (index: number) => {
    setRelations(prev => prev.filter((_, i) => i !== index))
  }

  const updateRelation = (index: number, field: string, value: string | number) => {
    setRelations(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }

  return (
    <div className="max-w-2xl space-y-6">
      {success && (
        <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">
          创意已成功归档！
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">标题 *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="创意标题"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">内容 *</Label>
          <Textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="详细描述这个创意..."
            className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">摘要</Label>
          <Input
            value={form.summary}
            onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="一句话概括"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">层级</Label>
            <select
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
            >
              {Object.entries(LAYER_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>{conf.icon} {conf.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">状态</Label>
            <select
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
            >
              {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>{conf.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">优先级 (0-100)</Label>
            <Input
              type="number"
              value={form.priority}
              onChange={e => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
              min={0} max={100}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">完成度 (0-100)</Label>
            <Input
              type="number"
              value={form.completion}
              onChange={e => setForm(prev => ({ ...prev, completion: parseInt(e.target.value) || 0 }))}
              min={0} max={100}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">标签 (逗号分隔)</Label>
          <Input
            value={form.tags}
            onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="标签1, 标签2, 标签3"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">来源</Label>
          <Input
            value={form.source}
            onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
            placeholder="哪个对话/文档产生的"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* 关联关系 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">关联关系</Label>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={addRelation}>
            <PlusCircle className="h-3 w-3 mr-1" />添加关系
          </Button>
        </div>
        {relations.map((rel, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
            <select
              value={rel.toId}
              onChange={e => updateRelation(i, 'toId', e.target.value)}
              className="flex-1 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
            >
              <option value="">选择目标...</option>
              {archives.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            <select
              value={rel.relationType}
              onChange={e => updateRelation(i, 'relationType', e.target.value)}
              className="w-24 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
            >
              {Object.entries(RELATION_TYPE_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>{conf.icon} {conf.label}</option>
              ))}
            </select>
            <Input
              type="number"
              value={rel.distance}
              onChange={e => updateRelation(i, 'distance', parseInt(e.target.value) || 50)}
              className="w-16 bg-slate-700 border-slate-600 text-white text-xs p-1.5"
              min={0} max={100}
            />
            <Button size="sm" variant="ghost" className="text-red-400 h-7 w-7 p-0" onClick={() => removeRelation(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        disabled={loading || !form.title || !form.content}
        onClick={handleSubmit}
      >
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />归档中...</> : '🗄️ 归档创意'}
      </Button>
    </div>
  )
}

// ====== 分类管理 ======

function CategoryManager({ categories, onRefresh }: { categories: ArchiveCategory[]; onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#6b7280',
    layer: 'application',
    parentCategoryId: ''
  })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.name) return
    setLoading(true)
    try {
      const res = await fetch('/api/archive/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          parentCategoryId: form.parentCategoryId || null
        })
      })
      if (res.ok) {
        setShowAddForm(false)
        setForm({ name: '', description: '', icon: '📁', color: '#6b7280', layer: 'application', parentCategoryId: '' })
        onRefresh()
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">分类体系</h3>
        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle className="h-3 w-3 mr-1" />新建分类
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">名称</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                  placeholder="分类名称"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">层级</Label>
                <select
                  value={form.layer}
                  onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
                >
                  {Object.entries(LAYER_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.icon} {conf.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">描述</Label>
              <Input
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white text-sm"
                placeholder="分类描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">图标</Label>
                <Input
                  value={form.icon}
                  onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">颜色</Label>
                <Input
                  value={form.color}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                  type="color"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">父分类 (可选)</Label>
              <select
                value={form.parentCategoryId}
                onChange={e => setForm(prev => ({ ...prev, parentCategoryId: e.target.value }))}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
              >
                <option value="">无 (顶级分类)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={loading || !form.name} onClick={handleCreate}>
              {loading ? '创建中...' : '创建分类'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 分类列表 */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">暂无分类，请先归档种子数据或创建分类</div>
        ) : (
          categories.map(cat => {
            const layerConf = getLayerConfig(cat.layer)
            return (
              <Card key={cat.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-white font-medium text-sm">{cat.name}</span>
                      <Badge className={`${layerConf.bgClass} ${layerConf.textClass} border-0 text-[10px]`}>
                        {layerConf.label}
                      </Badge>
                      <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px]">
                        {cat._count?.archives || 0} 条归档
                      </Badge>
                    </div>
                    {cat.description && (
                      <span className="text-xs text-slate-500">{cat.description}</span>
                    )}
                  </div>
                  {/* 子分类 */}
                  {cat.childCategories && cat.childCategories.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {cat.childCategories.map(child => (
                        <div key={child.id} className="flex items-center gap-2 text-xs text-slate-400">
                          <GitBranch className="h-3 w-3" />
                          <span>{child.icon} {child.name}</span>
                          <span className="text-slate-600">({child._count?.archives || 0})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// ====== 主页面 ======

export default function ArchivePage() {
  const [archives, setArchives] = useState<CreativeArchive[]>([])
  const [relations, setRelations] = useState<ArchiveRelation[]>([])
  const [categories, setCategories] = useState<ArchiveCategory[]>([])
  const [stats, setStats] = useState<ArchiveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLayer, setFilterLayer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedArchive, setSelectedArchive] = useState<CreativeArchive | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [archiveRes, relationRes, categoryRes] = await Promise.all([
        fetch('/api/archive'),
        fetch('/api/archive/relations'),
        fetch('/api/archive/categories')
      ])

      if (archiveRes.ok) {
        const data = await archiveRes.json()
        setArchives(data.archives || [])
        setStats(data.stats || null)
      }
      if (relationRes.ok) {
        const data = await relationRes.json()
        setRelations(data.relations || [])
      }
      if (categoryRes.ok) {
        const data = await categoryRes.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/archive/seed', { method: 'POST' })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('种子数据创建失败:', err)
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/archive/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
        setSelectedArchive(null)
      }
    } catch {
      // ignore
    }
  }

  // 过滤
  const filteredArchives = archives.filter(a => {
    const matchSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tags || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchLayer = filterLayer === 'all' || a.layer === filterLayer
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    return matchSearch && matchLayer && matchStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部导航 */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Archive className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">创意归档 · 思维图谱</h1>
                <p className="text-xs text-slate-400">按层级/距离/依赖关系分类管理所有创意</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                {seeding ? '导入中...' : '导入种子数据'}
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={fetchData}>
                <RefreshCw className="h-3 w-3 mr-1" />刷新
              </Button>
              <a href="/desktop">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  ← 桌面
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-xs">
              <Grid3X3 className="h-3 w-3 mr-1" />归档总览
            </TabsTrigger>
            <TabsTrigger value="layers" className="data-[state=active]:bg-slate-700 text-xs">
              <Layers className="h-3 w-3 mr-1" />层级架构
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-slate-700 text-xs">
              <Network className="h-3 w-3 mr-1" />思维图谱
            </TabsTrigger>
            <TabsTrigger value="matrix" className="data-[state=active]:bg-slate-700 text-xs">
              <GitBranch className="h-3 w-3 mr-1" />距离矩阵
            </TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-slate-700 text-xs">
              <PlusCircle className="h-3 w-3 mr-1" />新增创意
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-slate-700 text-xs">
              <BookOpen className="h-3 w-3 mr-1" />分类管理
            </TabsTrigger>
          </TabsList>

          {/* ====== Tab 1: 归档总览 ====== */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* 统计卡片 */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-slate-400">总创意数</div>
                  </CardContent>
                </Card>
                {Object.entries(LAYER_CONFIG).map(([key, conf]) => (
                  <Card key={key} className={`${conf.bgClass} border ${conf.borderClass}`}>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-white">{stats.byLayer[key as keyof typeof stats.byLayer] || 0}</div>
                      <div className="text-xs text-slate-300">{conf.icon} {conf.label}</div>
                    </CardContent>
                  </Card>
                ))}
                {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                  <Card key={key} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-white">{stats.byStatus[key as keyof typeof stats.byStatus] || 0}</div>
                      <div className="text-xs text-slate-400">{conf.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 搜索和筛选 */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="搜索创意..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>
              <select
                value={filterLayer}
                onChange={e => setFilterLayer(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-md text-white text-sm"
              >
                <option value="all">所有层级</option>
                {Object.entries(LAYER_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.icon} {conf.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-md text-white text-sm"
              >
                <option value="all">所有状态</option>
                {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>

            {/* 归档卡片网格 */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : filteredArchives.length === 0 ? (
              <div className="text-center py-20">
                <Archive className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 mb-2">暂无创意归档</p>
                <p className="text-sm text-slate-500 mb-4">点击上方"导入种子数据"按钮，将用户草稿中的创意导入系统</p>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleSeed} disabled={seeding}>
                  <Sparkles className="h-4 w-4 mr-2" />导入种子数据
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArchives.map(archive => (
                  <ArchiveCard
                    key={archive.id}
                    archive={archive}
                    onClick={() => setSelectedArchive(archive)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ====== Tab 2: 层级架构 ====== */}
          <TabsContent value="layers" className="mt-4 space-y-4">
            {Object.entries(LAYER_CONFIG).reverse().map(([layer, conf]) => {
              const layerArchives = archives.filter(a => a.layer === layer)
              return (
                <Card key={layer} className={`${conf.bgClass} border ${conf.borderClass}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{conf.icon}</span>
                        <CardTitle className={`${conf.textClass} text-lg`}>{conf.label}</CardTitle>
                        <Badge variant="outline" className={`${conf.borderClass} ${conf.textClass} text-xs`}>
                          {layerArchives.length} 项
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-slate-400 text-xs">
                      {layer === 'philosophy' && '最底层的思想根基，指导整个体系的方向'}
                      {layer === 'foundation' && '基础设施和核心系统，支撑上层功能'}
                      {layer === 'architecture' && '架构设计和模块规划，连接底层与应用'}
                      {layer === 'application' && '具体功能和应用场景，直接面向用户'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {layerArchives.length === 0 ? (
                      <p className="text-sm text-slate-500 py-2">暂无归档</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {layerArchives.map(archive => (
                          <div
                            key={archive.id}
                            className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-700/50"
                            onClick={() => setSelectedArchive(archive)}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusConfig(archive.status).bgClass} text-white text-[10px]`}>
                                {getStatusConfig(archive.status).label}
                              </Badge>
                              <span className="text-sm text-white">{archive.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={archive.completion} className="w-12 h-1.5" />
                              <span className="text-[10px] text-slate-500">{archive.completion}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* 层级依赖关系图 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">层级依赖流向</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
                  {Object.entries(LAYER_CONFIG).reverse().map(([layer, conf], i) => (
                    <div key={layer} className="flex items-center gap-2">
                      <div className={`px-4 py-2 rounded-lg ${conf.bgClass} border ${conf.borderClass} text-center`}>
                        <div className={`text-lg font-bold ${conf.textClass}`}>{conf.icon}</div>
                        <div className={`text-xs ${conf.textClass}`}>{conf.label}</div>
                      </div>
                      {i < 3 && (
                        <ArrowDown className="h-6 w-6 text-slate-600 rotate-[-90deg]" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">哲学层 → 底层 → 架构层 → 应用层（由根基到实现）</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== Tab 3: 思维图谱 ====== */}
          <TabsContent value="graph" className="mt-4">
            {archives.length === 0 ? (
              <div className="text-center py-20">
                <Network className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">暂无数据，请先导入种子数据</p>
              </div>
            ) : (
              <ThoughtGraph archives={archives} relations={relations} />
            )}
          </TabsContent>

          {/* ====== Tab 4: 距离矩阵 ====== */}
          <TabsContent value="matrix" className="mt-4">
            {relations.length === 0 ? (
              <div className="text-center py-20">
                <GitBranch className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">暂无关系数据，请先导入种子数据</p>
              </div>
            ) : (
              <DistanceMatrix archives={archives} relations={relations} />
            )}
          </TabsContent>

          {/* ====== Tab 5: 新增创意 ====== */}
          <TabsContent value="add" className="mt-4">
            <AddArchiveForm archives={archives} onCreated={fetchData} />
          </TabsContent>

          {/* ====== Tab 6: 分类管理 ====== */}
          <TabsContent value="categories" className="mt-4">
            <CategoryManager categories={categories} onRefresh={fetchData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 详情弹窗 */}
      {selectedArchive && (
        <ArchiveDetailModal
          archive={selectedArchive}
          onClose={() => setSelectedArchive(null)}
        />
      )}

      {/* 删除确认 */}
      {selectedArchive && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(selectedArchive.id)}
            className="shadow-lg"
          >
            <Trash2 className="h-3 w-3 mr-1" />删除此创意
          </Button>
        </div>
      )}
    </div>
  )
}
