'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Users, UserPlus, Building2, Shield, Heart,
  PlusCircle, Loader2, CheckCircle, AlertTriangle as AlertTriangleIcon
} from 'lucide-react'

interface OrgMember {
  id: string
  userId: string
  role: string
  isDisabled: boolean
  disabilityType: string | null
  disabilityLevel: string | null
  joinedAt: string
  user: { id: string; name: string | null; avatar: string | null; email: string }
}

interface OrgUnit {
  id: string
  name: string
  unitType: string
  parentUnitId: string | null
  disabilityPriorityScore: number
  description: string | null
  status: string
  members: OrgMember[]
  childUnits: any[]
  disabledCount: number
  ableCount: number
  maxMembers: number
  fillRate: number
}

const UNIT_TYPE_INFO: Record<string, { label: string; structure: string; maxMembers: number; maxDisabled: number; color: string }> = {
  group: { label: '组', structure: '1残+6健全=7人', maxMembers: 7, maxDisabled: 1, color: 'bg-blue-500' },
  squad: { label: '班', structure: '6+36+6=48人', maxMembers: 48, maxDisabled: 6, color: 'bg-purple-500' },
  battalion: { label: '营', structure: '336人', maxMembers: 336, maxDisabled: 36, color: 'bg-red-500' },
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  disabled: { label: '残疾人', color: 'bg-red-100 text-red-700' },
  able: { label: '健全人', color: 'bg-blue-100 text-blue-700' },
  leader: { label: '组长', color: 'bg-amber-100 text-amber-700' },
  deputy: { label: '副组长', color: 'bg-green-100 text-green-700' },
}

const DISABILITY_LEVELS = ['一级(最重)', '二级', '三级', '四级(最轻)']
const DISABILITY_TYPES = ['肢体', '视力', '听力', '智力', '精神', '多重']

export default function OrganizationPage() {
  const [units, setUnits] = useState<OrgUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [demoUserId, setDemoUserId] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    name: '',
    unitType: 'group',
    description: ''
  })

  const [joinForm, setJoinForm] = useState({
    isDisabled: false,
    disabilityType: '',
    disabilityLevel: '',
    role: 'able'
  })

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    try {
      // 获取演示用户
      const userRes = await fetch('/api/users/demo')
      if (userRes.ok) {
        const user = await userRes.json()
        setDemoUserId(user.id)
      }
      await loadUnits()
    } catch (error) {
      console.error('初始化失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnits = async () => {
    try {
      const res = await fetch('/api/organization')
      if (res.ok) {
        const data = await res.json()
        setUnits(data.units || [])
      }
    } catch (error) {
      console.error('加载组织列表失败:', error)
    }
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name) return

    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setCreateForm({ name: '', unitType: 'group', description: '' })
        setShowCreateForm(false)
        await loadUnits()
      } else {
        const err = await res.json()
        alert(err.error || '创建失败')
      }
    } catch (error) {
      console.error('创建组织失败:', error)
    }
  }

  const handleJoinUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoUserId || !selectedUnitId) return

    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoUserId,
          unitId: selectedUnitId,
          ...joinForm
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setShowJoinForm(false)
        setSelectedUnitId(null)
        await loadUnits()
      } else {
        const err = await res.json()
        alert(err.error || '加入失败')
      }
    } catch (error) {
      console.error('加入组织失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">正在加载组织架构...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">命运共同体</h1>
              <p className="text-blue-100">组织架构 · 残健共建 · 优先级体系</p>
            </div>
          </div>

          {/* 组织架构说明 */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100">组（最小单元）</span>
              </div>
              <div className="text-2xl font-bold">1残 + 6健全</div>
              <p className="text-xs text-blue-200 mt-1">7人一组，1个残疾人+6个健全人</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-300" />
                <span className="text-blue-100">班（扩展单元）</span>
              </div>
              <div className="text-2xl font-bold">6+36+6</div>
              <p className="text-xs text-blue-200 mt-1">48人一班，6残+36健全+6管理</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-red-300" />
                <span className="text-blue-100">优先级原则</span>
              </div>
              <div className="text-2xl font-bold">越重越先</div>
              <p className="text-xs text-blue-200 mt-1">残疾程度越严重，优先级越高</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">组织列表</h2>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            创建组织
          </Button>
        </div>

        {/* 创建组织表单 */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>创建新的组织单元</CardTitle>
              <CardDescription>
                组建命运共同体，1残+6健全为最小单元
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUnit} className="space-y-4">
                <div>
                  <Label>组织名称 *</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：圆聚第一组"
                    required
                  />
                </div>

                <div>
                  <Label>组织类型</Label>
                  <div className="flex gap-3 mt-2">
                    {Object.entries(UNIT_TYPE_INFO).map(([key, info]) => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant={createForm.unitType === key ? 'default' : 'outline'}
                        onClick={() => setCreateForm(prev => ({ ...prev, unitType: key }))}
                      >
                        {info.label}（{info.structure}）
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>描述</Label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述组织的目标和定位..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                    创建组织
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 加入组织表单 */}
        {showJoinForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>加入组织</CardTitle>
              <CardDescription>
                选择您的身份信息，加入命运共同体
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinUnit} className="space-y-4">
                <div>
                  <Label>身份类型</Label>
                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={!joinForm.isDisabled ? 'default' : 'outline'}
                      onClick={() => setJoinForm(prev => ({ ...prev, isDisabled: false, role: 'able' }))}
                    >
                      健全人
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={joinForm.isDisabled ? 'default' : 'outline'}
                      onClick={() => setJoinForm(prev => ({ ...prev, isDisabled: true, role: 'disabled' }))}
                    >
                      残疾人
                    </Button>
                  </div>
                </div>

                {joinForm.isDisabled && (
                  <>
                    <div>
                      <Label>残疾类型</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DISABILITY_TYPES.map(type => (
                          <Button
                            key={type}
                            type="button"
                            size="sm"
                            variant={joinForm.disabilityType === type ? 'default' : 'outline'}
                            onClick={() => setJoinForm(prev => ({ ...prev, disabilityType: type }))}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>残疾等级</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DISABILITY_LEVELS.map(level => (
                          <Button
                            key={level}
                            type="button"
                            size="sm"
                            variant={joinForm.disabilityLevel === level ? 'default' : 'outline'}
                            onClick={() => setJoinForm(prev => ({ ...prev, disabilityLevel: level }))}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                    确认加入
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowJoinForm(false); setSelectedUnitId(null) }}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 组织列表 */}
        {units.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">暂无组织单元</p>
              <p className="text-sm mb-4">创建第一个命运共同体组织</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                创建组织
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {units.map(unit => {
              const typeInfo = UNIT_TYPE_INFO[unit.unitType] || UNIT_TYPE_INFO.group
              return (
                <Card key={unit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          <h3 className="text-lg font-semibold">{unit.name}</h3>
                          <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                            {unit.status === 'active' ? '活跃' : '组建中'}
                          </Badge>
                        </div>
                        {unit.description && (
                          <p className="text-sm text-gray-600">{unit.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUnitId(unit.id)
                          setShowJoinForm(true)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        加入
                      </Button>
                    </div>

                    {/* 成员统计 */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{unit.members.length}</div>
                        <div className="text-xs text-gray-500">总成员</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">{unit.disabledCount}</div>
                        <div className="text-xs text-red-500">残疾人</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{unit.ableCount}</div>
                        <div className="text-xs text-blue-500">健全人</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-amber-600">{unit.fillRate}%</div>
                        <div className="text-xs text-amber-500">满员率</div>
                      </div>
                    </div>

                    <Progress value={unit.fillRate} className="h-2 mb-4" />

                    {/* 成员列表 */}
                    {unit.members.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {unit.members.map(member => {
                          const roleInfo = ROLE_LABELS[member.role] || ROLE_LABELS.able
                          return (
                            <div key={member.id} className="flex items-center gap-1">
                              <Badge className={roleInfo.color}>
                                {member.user.name || '用户'}
                              </Badge>
                              {member.isDisabled && (
                                <Badge variant="outline" className="text-xs text-red-500 border-red-300">
                                  {member.disabilityLevel || '残疾'}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 优先级 */}
                    {unit.disabilityPriorityScore > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <span>残疾人优先级评分: {unit.disabilityPriorityScore}/100</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 架构说明 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>命运共同体架构说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">最小单元 - 组（7人）</h3>
                  <p className="text-sm">
                    1个残疾人 + 6个健全人组成最基本的命运共同体。残疾人是核心，健全人是帮扶者。
                    残疾人的残疾程度决定该组的优先级——越严重越优先获得帮扶资源。
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">残</div>
                      <div className="flex gap-2">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs">健{i}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">扩展单元 - 班（48人）</h3>
                  <p className="text-sm">
                    6个残疾人 + 36个健全人 + 6个管理人员组成班。多个组可以组成班，
                    多个班可以组成营，形成层级的命运共同体结构。
                  </p>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center text-white text-[8px]">残{i}</div>
                        ))}
                      </div>
                      <span className="text-gray-400">+</span>
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {Array.from({length: 12}).map((_, i) => (
                          <div key={i} className="w-5 h-5 bg-blue-300 rounded-full" />
                        ))}
                        <span className="text-xs text-gray-500">...36健</span>
                      </div>
                      <span className="text-gray-400">+</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-[8px]">管{i}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mt-4">
                <h3 className="font-semibold text-amber-800 mb-2">核心原则</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>- 健全人不是施舍者，而是共建者，通过帮扶获得未来股权投资机会</li>
                  <li>- 残疾人的残疾程度 = 优先级，越严重越先获得帮扶</li>
                  <li>- 成员承诺未来时间、精力、忠诚、创造力和40%工资义务捐赠</li>
                  <li>- 正义的方向：向着底层人、残疾人、农民、用户、被消费者</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
