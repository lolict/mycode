'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'

interface ModuleConfig {
  id: string
  name: string
  version: string
  description: string
  category: string
  dependencies?: string[]
  config?: Record<string, any>
}

interface ModuleRegistryContextType {
  modules: Map<string, ModuleConfig>
  registerModule: (module: ModuleConfig) => void
  unregisterModule: (id: string) => void
  getModule: (id: string) => ModuleConfig | undefined
  getModulesByCategory: (category: string) => ModuleConfig[]
}

const ModuleRegistryContext = createContext<ModuleRegistryContextType | null>(null)

export function ModuleRegistryProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState(new Map<string, ModuleConfig>())

  const registerModule = useCallback((mod: ModuleConfig) => {
    setModules(prev => {
      const next = new Map(prev)
      next.set(mod.id, mod)
      return next
    })
  }, [])

  const unregisterModule = useCallback((id: string) => {
    setModules(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const getModule = useCallback((id: string) => {
    return modules.get(id)
  }, [modules])

  const getModulesByCategory = useCallback((category: string) => {
    return Array.from(modules.values()).filter(mod => mod.category === category)
  }, [modules])

  return (
    <ModuleRegistryContext.Provider value={{
      modules,
      registerModule,
      unregisterModule,
      getModule,
      getModulesByCategory
    }}>
      {children}
    </ModuleRegistryContext.Provider>
  )
}

export function useModuleRegistry() {
  const context = useContext(ModuleRegistryContext)
  if (!context) {
    throw new Error('useModuleRegistry must be used within ModuleRegistryProvider')
  }
  return context
}