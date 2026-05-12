'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Cpu, BookOpen, Scale, User } from 'lucide-react'

const tabs = [
  { href: '/', label: '首页', icon: Home },
  { href: '/plugboard', label: '插板', icon: Cpu },
  { href: '/dexi', label: '德系', icon: BookOpen },
  { href: '/moral-equity', label: '道德', icon: Scale },
  { href: '/account', label: '我的', icon: User },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-around py-1">
          {tabs.map(tab => {
            const isActive = pathname === tab.href ||
              (tab.href !== '/' && pathname.startsWith(tab.href))
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600" />
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
