'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionContainerProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'pink' | 'purple' | 'gradient'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
}

export function SectionContainer({ 
  children, 
  className, 
  background = 'white',
  spacing = 'lg',
  id
}: SectionContainerProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    pink: 'bg-pink-50',
    purple: 'bg-purple-50',
    gradient: 'bg-gradient-to-r from-pink-100 to-purple-100'
  }

  const spacingClasses = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-24'
  }

  return (
    <section 
      id={id}
      className={cn(
        backgroundClasses[background],
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </section>
  )
}