'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft, Sparkles, Heart, Scale, HandHeart, Shield,
  TrendingUp, Trophy, Star, Zap, Brain, Activity, Target,
  Coins, Crown, Flame, Calendar, CheckCircle, BookOpen,
  Landmark, Users, Siren, Eye, Upload, Download, RotateCcw,
  Search, Edit3, Save, X, FileJson, AlertCircle, CheckCircle2
} from 'lucide-react'

interface VocabItem {
  id: string
  vocabKey: string
  defaultValue: string
  customValue: string | null
  category: string
  description: string
  scope: string
  moduleCode: string | null
  isCustomized: boolean
  displayValue: string
}

interface VocabCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isSystem: boolean
}

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = useState<VocabItem[]>([])
  const [categories, setCategories] = useState<VocabCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [importResult, setImportResult] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadVocab()
  }, [])

  async function loadVocab() {
    try {
      const res = await fetch('/api/moral-equity/vocabulary')
      if (res.ok) {
        const data = await res.json()
        setVocabularies(data.vocabularies || [])
        setCategories(data.categories || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('加载词汇失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveVocab(vocabKey: string, customValue: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/moral-equity/vocabulary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabKey, customValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setVocabularies(prev => prev.map(v =>
          v.vocabKey === vocabKey
            ? { ...v, customValue: data.vocabulary.customValue, isCustomized: data.vocabulary.isCustomized, displayValue: data.vocabulary.displayValue }
            : v
        ))
        setEditingKey(null)
      }
    } catch (error) {
      console.error('保存词汇失败:', error)
    } finally {
      setSaving(false)
    }
  }

  async function resetAll(category?: string) {
    if (!confirm(category ? `确定要重置此分类下所有自定义词汇？` : '确定要重置所有自定义词汇？')) return
    try {
      const url = category
        ? `/api/moral-equity/vocabulary?category=${category}`
        : '/api/moral-equity/vocabulary'
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        await loadVocab()
      }
    } catch (error) {
      console.error('重置词汇失败:', error)
    }
  }

  async function handleImport() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      let parsed: any
      try {
        parsed = JSON.parse(text)
      } catch {
        alert('文件格式错误：请上传有效的JSON文件')
        return
      }

      const res = await fetch('/api/moral-equity/vocabulary/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: parsed,
          source: 'json',
          fileName: file.name,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setImportResult(data)
        await loadVocab()
        setTimeout(() => setImportResult(null), 8000)
      } else {
        alert(`导入失败: ${data.error}\n${data.errors?.join('\n') || ''}`)
      }
    } catch (error) {
      console.error('导入文件失败:', error)
      alert('读取文件失败')
    }

    // 重置input以允许重复导入
    e.target.value = ''
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/moral-equity/vocabulary')
      if (res.ok) {
        const data = await res.json()
        const exportDoc = {
          version: '1.0',
          description: `圆聚助残平台词汇导出 — ${new Date().toISOString().split('T')[0]}`,
          vocabularies: data.vocabularies.map((v: any) => ({
            vocabKey: v.vocabKey,
            customValue: v.displayValue,
            category: v.category,
            description: v.description,
          })),
        }
        const blob = new Blob([JSON.stringify(exportDoc, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vocab-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  // 过滤
  const filtered = vocabularies.filter(v => {
    if (activeCategory !== 'all' && v.category !== activeCategory) return false
    if (searchQuery && !v.vocabKey.includes(searchQuery) && !v.defaultValue.includes(searchQuery) && !(v.customValue || '').includes(searchQuery) && !v.description.includes(searchQuery)) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Activity className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/moral-equity">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                道德股权
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">词汇管理</h1>
            <p className="text-white/80">自定义所有术语，定义你的道德语言体系</p>
          </div>
        </div>
      </section>

      {/* 导入结果提示 */}
      {importResult && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="bg-green-50 border-green-300 shadow-xl max-w-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-800">导入完成</span>
              </div>
              <p className="text-sm text-green-700">
                共 {importResult.importLog.total} 条，成功 {importResult.importLog.successCount} 条
                {importResult.importLog.failCount > 0 && `，失败 ${importResult.importLog.failCount} 条`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 统计 + 操作 */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-4 text-sm">
            <Badge variant="secondary">共 {stats?.total || 0} 条词汇</Badge>
            <Badge className="bg-amber-100 text-amber-700">已自定义 {stats?.customized || 0} 条</Badge>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" />
              导入JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
            <Button variant="outline" size="sm" onClick={() => resetAll()} className="text-red-600 hover:text-red-700">
              <RotateCcw className="h-4 w-4 mr-1" />
              全部重置
            </Button>
          </div>
        </div>

        {/* 搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索词汇（键名/默认值/自定义值/描述）"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 分类标签 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-blue-50'
            }`}
          >
            全部 ({vocabularies.length})
          </button>
          {categories.map(cat => {
            const count = vocabularies.filter(v => v.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-blue-50'
                }`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* 词汇列表 */}
        <div className="space-y-3">
          {filtered.map(v => (
            <Card key={v.id} className={`transition-all ${v.isCustomized ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{v.vocabKey}</code>
                      {v.isCustomized && <Badge className="bg-amber-100 text-amber-700 text-xs">已自定义</Badge>}
                      <Badge variant="outline" className="text-xs">{categories.find(c => c.id === v.category)?.name || v.category}</Badge>
                    </div>

                    {editingKey === v.vocabKey ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          placeholder={v.defaultValue}
                          className="max-w-xs"
                          maxLength={20}
                        />
                        <Button size="sm" onClick={() => saveVocab(v.vocabKey, editValue)} disabled={saving}>
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-1">
                        <div>
                          <span className="text-xs text-gray-400">默认:</span>
                          <span className="text-sm text-gray-500 ml-1">{v.defaultValue}</span>
                        </div>
                        {v.isCustomized && v.customValue && (
                          <>
                            <span className="text-gray-300">→</span>
                            <div>
                              <span className="text-xs text-amber-500">自定义:</span>
                              <span className="text-sm font-bold text-amber-700 ml-1">{v.customValue}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{v.description}</p>
                  </div>

                  {editingKey !== v.vocabKey && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingKey(v.vocabKey)
                        setEditValue(v.customValue || '')
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">没有找到匹配的词汇</h3>
              <p className="text-gray-400 mt-1">尝试调整搜索条件或分类筛选</p>
            </CardContent>
          </Card>
        )}

        {/* 导入格式说明 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileJson className="h-5 w-5 text-blue-600" />
              JSON导入格式说明
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              管理者可以通过上传JSON文档来批量自定义词汇。文档格式如下：
            </p>
            <pre className="bg-white rounded-lg p-4 text-xs overflow-x-auto border">
{`{
  "version": "1.0",
  "description": "自定义词汇包描述",
  "vocabularies": [
    {
      "vocabKey": "value_unit",
      "customValue": "功德"
    },
    {
      "vocabKey": "equity_name",
      "customValue": "德股"
    }
  ]
}`}
            </pre>
            <p className="text-xs text-gray-500 mt-3">
              每条词汇的vocabKey必须与系统词汇键名一致（可在上方列表中查看所有可用键名）。
              也可导入系统默认词库中不存在的键名，将自动创建新词汇条目。单次导入上限500条。
            </p>
          </CardContent>
        </Card>

        {/* 分类说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">词汇分类说明</CardTitle>
            <CardDescription>哪些词汇可以被定义？每个分类管理不同类型的术语对象</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 rounded-lg border bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }}>
                      {cat.name}
                    </Badge>
                    {cat.isSystem && <Badge className="text-xs bg-gray-100 text-gray-500">系统级</Badge>}
                  </div>
                  <p className="text-xs text-gray-600">{cat.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
