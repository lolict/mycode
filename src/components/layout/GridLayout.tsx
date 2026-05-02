'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GridLayoutProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

export function GridLayout({ 
  children, 
  className, 
  cols = 3,
  gap = 'md',
  responsive = true
}: GridLayoutProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6'
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  const responsiveClasses = responsive ? {
    1: '',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  } : {}

  return (
    <div className={cn(
      'grid',
      colsClasses[cols],
      gapClasses[gap],
      responsiveClasses[cols],
      className
    )}>
      {children}
    </div>
  )
}