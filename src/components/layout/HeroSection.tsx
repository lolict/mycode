'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ResponsiveContainer, SectionContainer } from './'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  showButtons?: boolean
}

export function HeroSection({ 
  title = "圆聚助残",
  subtitle = "供残捐 · 益企捐 - 新天枰倾斜公益平台",
  description = "专注解决农村残疾人和残疾人关键困境，各尽其能、物尽其用、人尽其力",
  showButtons = true
}: HeroSectionProps) {
  return (
    <SectionContainer background="gradient" spacing="xl">
      <ResponsiveContainer size="lg" padding="md">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <Heart className="relative h-16 w-16 text-pink-500 fill-pink-500 transform group-hover:scale-110 transition-transform" />
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Title with responsive typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
            <span className="block text-2xl sm:text-3xl md:text-3xl text-pink-600 mt-2 font-normal">
              {subtitle}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/apps">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  应用中心
                </Button>
              </Link>
              <Link href="/projects">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  助残项目
                </Button>
              </Link>
              <Link href="/ledger">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-pink-500 text-pink-600 hover:bg-pink-50 px-8 hover:border-pink-600 transition-colors"
                >
                  记名账本
                </Button>
              </Link>
              <Link href="/account">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-purple-500 text-purple-600 hover:bg-purple-50 px-8 hover:border-purple-600 transition-colors"
                >
                  共同体账户
                </Button>
              </Link>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </SectionContainer>
  )
}