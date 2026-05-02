'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'pink' | 'purple' | 'blue' | 'green' | 'yellow' | 'red'
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend,
  className 
}: StatsCardProps) {
  const colorClasses = {
    pink: {
      bg: 'bg-pink-100',
      icon: 'text-pink-600',
      trend: 'text-pink-600'
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      trend: 'text-purple-600'
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-600',
      trend: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      trend: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      trend: 'text-red-600'
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className={cn('hover:shadow-lg transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn('p-3 rounded-full', colors.bg)}>
              <Icon className={cn('h-6 w-6', colors.icon)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={cn('text-sm font-medium', colors.trend)}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}