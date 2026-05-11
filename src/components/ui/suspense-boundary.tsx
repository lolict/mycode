'use client'

import React, { Suspense } from 'react'
import { Card, CardContent } from './card'
import { Skeleton } from './skeleton'

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'form'
  count?: number
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        )
      
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )
      
      case 'table':
        return (
          <div className="space-y-3">
            <div className="border rounded">
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'form':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        )
      
      default:
        return <Skeleton className="h-32 w-full" />
    }
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}

interface SuspenseBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingType?: LoadingSkeletonProps['type']
  loadingCount?: LoadingSkeletonProps['count']
  error?: React.ReactNode
}

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
  loadingType = 'card',
  loadingCount = 1,
  error
}) => {
  return (
    <Suspense 
      fallback={fallback || <LoadingSkeleton type={loadingType} count={loadingCount} />}
    >
      {children}
    </Suspense>
  )
}

// 高阶组件版本
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<SuspenseBoundaryProps, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <SuspenseBoundary {...options}>
        <Component {...props} />
      </SuspenseBoundary>
    )
  }
}