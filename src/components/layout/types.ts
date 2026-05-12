import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

// ResponsiveContainer
export interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

// SectionContainer
export interface SectionContainerProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'pink' | 'purple' | 'gradient'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
}

// GridLayout
export interface GridLayoutProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

// HeroSection
export interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  showButtons?: boolean
}

// StatsCard
export interface StatsCardProps {
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

// ProjectCard
export interface ProjectCardProps {
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