'use client'

import React, { useState, useEffect } from 'react'
import { getLivingSystemStatus } from '@/core/v2'

interface VitalSigns {
  nervous: {
    activePlugs: Array<{ id: string; name: string; type: string; channels: string[] }>
    totalPlugs: number
    channels: string[]
    recentSignals: Array<{ id: string; channel: string; from: string; timestamp: number }>
  }
  digestive: {
    totalErrors: number
    byGrade: Record<string, number>
    unhandled: number
    recentCritical: Array<{ id: string; message: string; source: string; timestamp: number }>
  }
  dopamine: {
    totalRecords: number
    totalDopamine: number
    uniqueUsers: number
    actionTypeDistribution: Record<string, number>
  }
  timestamp: number
}

/**
 * 活体系统生命体征面板
 * 像医院的心电监护仪一样，实时展示三大系统的运行状态
 */
export function VitalSignsPanel() {
  const [vitals, setVitals] = useState<VitalSigns | null>(null)

  useEffect(() => {
    const update = () => {
      try {
        setVitals(getLivingSystemStatus() as VitalSigns)
      } catch {
        // 系统未初始化时忽略
      }
    }

    update()
    const interval = setInterval(update, 5000) // 每5秒刷新

    return () => clearInterval(interval)
  }, [])

  if (!vitals) {
    return (
      <div className="p-4 text-center text-gray-400">
        系统尚未启动...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 生命体征概览 */}
      <div className="grid grid-cols-3 gap-3">
        <VitalCard
          icon="🧠"
          name="神经系统"
          status={vitals.nervous.totalPlugs > 0 ? 'active' : 'idle'}
          detail={`${vitals.nervous.activePlugs.length} 个模块在线`}
          color="blue"
        />
        <VitalCard
          icon="🫁"
          name="消化系统"
          status={vitals.digestive.unhandled === 0 ? 'healthy' : 'warning'}
          detail={`${vitals.digestive.totalErrors} 条记录`}
          color="green"
        />
        <VitalCard
          icon="💖"
          name="多巴胺"
          status={vitals.dopamine.totalDopamine > 0 ? 'active' : 'idle'}
          detail={`+${vitals.dopamine.totalDopamine} 多巴胺`}
          color="pink"
        />
      </div>

      {/* 神经系统：活跃模块 */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">🧠 神经连接</h4>
        <div className="flex flex-wrap gap-2">
          {vitals.nervous.activePlugs.map(plug => (
            <span
              key={plug.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {plug.name}
            </span>
          ))}
          {vitals.nervous.activePlugs.length === 0 && (
            <span className="text-xs text-blue-400">暂无模块接入</span>
          )}
        </div>
      </div>

      {/* 消化系统：错误分布 */}
      <div className="p-3 bg-green-50 rounded-lg">
        <h4 className="text-sm font-medium text-green-800 mb-2">🫁 消化状态</h4>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">💨 噪音: {vitals.digestive.byGrade.noise || 0}</span>
          <span className="text-yellow-600">⚠️ 已知: {vitals.digestive.byGrade.known || 0}</span>
          <span className="text-red-600">🚨 严重: {vitals.digestive.byGrade.critical || 0}</span>
        </div>
      </div>

      {/* 多巴胺：行为分布 */}
      <div className="p-3 bg-pink-50 rounded-lg">
        <h4 className="text-sm font-medium text-pink-800 mb-2">💖 多巴胺分泌</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(vitals.dopamine.actionTypeDistribution).map(([type, count]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full"
            >
              {getActionEmoji(type)} {getActionLabel(type)}: {count}
            </span>
          ))}
          {Object.keys(vitals.dopamine.actionTypeDistribution).length === 0 && (
            <span className="text-xs text-pink-400">暂无行为记录</span>
          )}
        </div>
      </div>

      {/* 最近信号 */}
      {vitals.nervous.recentSignals.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">📡 最近信号</h4>
          <div className="space-y-1">
            {vitals.nervous.recentSignals.slice(-5).reverse().map(signal => (
              <div key={signal.id} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="text-gray-300">→</span>
                <span className="font-mono text-blue-500">{signal.channel}</span>
                <span className="text-gray-400">from {signal.from}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VitalCard({
  icon,
  name,
  status,
  detail,
  color,
}: {
  icon: string
  name: string
  status: 'active' | 'idle' | 'healthy' | 'warning'
  detail: string
  color: 'blue' | 'green' | 'pink'
}) {
  const bgColors = { blue: 'bg-blue-50', green: 'bg-green-50', pink: 'bg-pink-50' }
  const statusColors = {
    active: 'bg-green-400',
    idle: 'bg-gray-300',
    healthy: 'bg-green-400',
    warning: 'bg-yellow-400',
  }

  return (
    <div className={`p-3 ${bgColors[color]} rounded-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className={`w-2 h-2 ${statusColors[status]} rounded-full ${status === 'active' ? 'animate-pulse' : ''}`} />
      </div>
      <div className="text-sm font-medium text-gray-800">{name}</div>
      <div className="text-xs text-gray-500">{detail}</div>
    </div>
  )
}

function getActionEmoji(type: string): string {
  const emojis: Record<string, string> = {
    donate: '💰',
    create_project: '📝',
    volunteer: '🤝',
    help: '🫂',
    share: '🔄',
    comment: '💬',
    verify: '✅',
  }
  return emojis[type] || '⭐'
}

function getActionLabel(type: string): string {
  const labels: Record<string, string> = {
    donate: '捐款',
    create_project: '创建项目',
    volunteer: '志愿',
    help: '互助',
    share: '分享',
    comment: '评论',
    verify: '验证',
  }
  return labels[type] || type
}
