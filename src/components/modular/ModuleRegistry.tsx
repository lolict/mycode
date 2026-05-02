'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

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
  const [modules] = useState(new Map<string, ModuleConfig>())

  const registerModule = (module: ModuleConfig) => {
    modules.set(module.id, module)
  }

  const unregisterModule = (id: string) => {
    modules.delete(id)
  }

  const getModule = (id: string) => {
    return modules.get(id)
  }

  const getModulesByCategory = (category: string) => {
    return Array.from(modules.values()).filter(module => module.category === category)
  }

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