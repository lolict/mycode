'use client'

import React from 'react'
import type { FiveDimensionScore } from '@/core/v2/dopamine'

interface DopamineScoreCardProps {
  score: FiveDimensionScore
  dopamineValue: number
  actionType?: string
  compact?: boolean
}

/**
 * 五维道德评分卡片
 * 展示：善良、恻隐、正义、奉献、严重度 + 总多巴胺值
 */
export function DopamineScoreCard({
  score,
  dopamineValue,
  actionType,
  compact = false,
}: DopamineScoreCardProps) {
  const dimensions = [
    { key: 'kindness', label: '善良', value: score.kindness, weight: '30%', color: '#f43f5e' },
    { key: 'compassion', label: '恻隐', value: score.compassion, weight: '25%', color: '#8b5cf6' },
    { key: 'justice', label: '正义', value: score.justice, weight: '20%', color: '#3b82f6' },
    { key: 'dedication', label: '奉献', value: score.dedication, weight: '15%', color: '#10b981' },
    { key: 'severity', label: '严重度', value: score.severity, weight: '10%', color: '#f59e0b' },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="text-2xl">💖</div>
        <div>
          <div className="text-sm font-medium text-purple-700">
            道德评分 {score.total}分
          </div>
          <div className="text-xs text-purple-500">
            多巴胺 +{dopamineValue}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💖</span>
          <h3 className="font-bold text-purple-800">道德评分</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{score.total}</div>
          <div className="text-xs text-purple-400">总分</div>
        </div>
      </div>

      {/* 行为类型标签 */}
      {actionType && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
            {getActionLabel(actionType)}
          </span>
        </div>
      )}

      {/* 五维评分条 */}
      <div className="space-y-3">
        {dimensions.map((dim) => (
          <div key={dim.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{dim.label}</span>
              <span className="text-xs text-gray-400">权重 {dim.weight}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dim.value}%`,
                    backgroundColor: dim.color,
                    opacity: dim.key === 'severity' ? 0.6 : 1,
                  }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right" style={{ color: dim.color }}>
                {dim.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 多巴胺值 */}
      <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">多巴胺值</span>
        <span className="text-lg font-bold text-pink-600">+{dopamineValue}</span>
      </div>
    </div>
  )
}

function getActionLabel(type: string): string {
  const labels: Record<string, string> = {
    donate: '捐款',
    create_project: '创建项目',
    volunteer: '志愿服务',
    help: '互助',
    share: '分享',
    comment: '评论',
    verify: '验证',
  }
  return labels[type] || type
}
