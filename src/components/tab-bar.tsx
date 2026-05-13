'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Cpu, Brain, Scale, Activity } from 'lucide-react'

const tabs = [
  { href: '/', label: '首页', icon: Home },
  { href: '/plugboard', label: '插板', icon: Cpu },
  { href: '/neural', label: '神经', icon: Brain },
  { href: '/moral-equity', label: '道德', icon: Scale },
  { href: '/living', label: '活体', icon: Activity },
]

export default function TabBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute top-0 w-8 h-0.5 bg-purple-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
