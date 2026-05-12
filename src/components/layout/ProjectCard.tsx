'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    category?: { name: string }
    currentAmount: number
    targetAmount: number
    donorCount: number
    endDate: string
    location?: string
  }
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const progressPercentage = getProgressPercentage(project.currentAmount, project.targetAmount)

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1', className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant="secondary" 
            className="bg-pink-100 text-pink-800 hover:bg-pink-200 transition-colors"
          >
            {project.category?.name || '联建项目'}
          </Badge>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 group-hover:text-pink-600 transition-colors">
          {project.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-gray-600">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">已筹集</span>
            <span className="font-semibold text-pink-600">
              {formatAmount(project.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">目标金额</span>
            <span className="font-medium">{formatAmount(project.targetAmount)}</span>
          </div>
        </div>

        {/* Project Meta */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.donorCount} 位支持者</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.endDate)}</span>
            </div>
          </div>
          
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/project/${project.id}`}>
          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
            参与联建
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}