'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 用户偏好设置
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  viewMode: 'grid' | 'list' | 'compact'
  sortBy: 'priority' | 'name' | 'recently'
  notifications: boolean
  animations: boolean
  compactMode: boolean
}

// 应用使用统计
interface AppUsage {
  appId: string
  lastUsed: Date
  usageCount: number
  totalTime: number // 毫秒
  averageSessionTime: number
}

// 用户收藏
interface UserFavorites {
  appId: string
  addedAt: Date
}

// 应用状态
interface AppState {
  // 用户偏好
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  
  // 应用使用统计
  appUsage: Record<string, AppUsage>
  recordAppUsage: (appId: string, sessionTime?: number) => void
  getRecentlyUsedApps: (limit?: number) => string[]
  
  // 用户收藏
  favorites: Record<string, UserFavorites>
  toggleFavorite: (appId: string) => void
  isFavorite: (appId: string) => boolean
  
  // 应用状态缓存
  appStates: Record<string, any>
  setAppState: (appId: string, state: any) => void
  getAppState: (appId: string) => any
  
  // 搜索历史
  searchHistory: string[]
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
  
  // 性能监控
  performanceMetrics: {
    lastRenderTime: number
    totalRenders: number
    errorCount: number
  }
  recordPerformance: (metrics: Partial<AppState['performanceMetrics']>) => void
  
  // 重置所有数据
  resetAll: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'zh-CN',
  viewMode: 'grid',
  sortBy: 'priority',
  notifications: true,
  animations: true,
  compactMode: false
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户偏好
      preferences: defaultPreferences,
      updatePreferences: (updates) => 
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),

      // 应用使用统计
      appUsage: {},
      recordAppUsage: (appId: string, sessionTime = 0) => {
        set((state) => {
          const current = state.appUsage[appId] || {
            appId,
            lastUsed: new Date(),
            usageCount: 0,
            totalTime: 0,
            averageSessionTime: 0
          }

          const newUsage = {
            ...current,
            lastUsed: new Date(),
            usageCount: current.usageCount + 1,
            totalTime: current.totalTime + sessionTime,
            averageSessionTime: (current.totalTime + sessionTime) / (current.usageCount + 1)
          }

          return {
            appUsage: {
              ...state.appUsage,
              [appId]: newUsage
            }
          }
        })
      },

      getRecentlyUsedApps: (limit = 5) => {
        const { appUsage } = get()
        return Object.values(appUsage)
          .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
          .slice(0, limit)
          .map(app => app.appId)
      },

      // 用户收藏
      favorites: {},
      toggleFavorite: (appId: string) => {
        set((state) => {
          const isFavorite = !!state.favorites[appId]
          
          if (isFavorite) {
            const { [appId]: removed, ...rest } = state.favorites
            return { favorites: rest }
          } else {
            return {
              favorites: {
                ...state.favorites,
                [appId]: {
                  appId,
                  addedAt: new Date()
                }
              }
            }
          }
        })
      },

      isFavorite: (appId: string) => {
        return !!get().favorites[appId]
      },

      // 应用状态缓存
      appStates: {},
      setAppState: (appId: string, appState: any) => {
        set((state) => ({
          appStates: {
            ...state.appStates,
            [appId]: appState
          }
        }))
      },

      getAppState: (appId: string) => {
        return get().appStates[appId]
      },

      // 搜索历史
      searchHistory: [],
      addToSearchHistory: (query: string) => {
        if (!query.trim()) return
        
        set((state) => {
          const history = state.searchHistory.filter(item => item !== query)
          history.unshift(query)
          
          // 限制历史记录数量
          const limitedHistory = history.slice(0, 20)
          
          return { searchHistory: limitedHistory }
        })
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] })
      },

      // 性能监控
      performanceMetrics: {
        lastRenderTime: 0,
        totalRenders: 0,
        errorCount: 0
      },

      recordPerformance: (metrics) => {
        set((state) => ({
          performanceMetrics: {
            ...state.performanceMetrics,
            ...metrics
          }
        }))
      },

      // 重置所有数据
      resetAll: () => {
        set({
          preferences: defaultPreferences,
          appUsage: {},
          favorites: {},
          appStates: {},
          searchHistory: [],
          performanceMetrics: {
            lastRenderTime: 0,
            totalRenders: 0,
            errorCount: 0
          }
        })
      }
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        appUsage: state.appUsage,
        favorites: state.favorites,
        searchHistory: state.searchHistory
        // 不持久化 appStates 和 performanceMetrics
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store hydrated:', state)
      }
    }
  )
)

// 选择器 hooks
export const usePreferences = () => useAppStore((state) => state.preferences)
export const useAppUsage = () => useAppStore((state) => state.appUsage)
export const useFavorites = () => useAppStore((state) => state.favorites)
export const useSearchHistory = () => useAppStore((state) => state.searchHistory)
export const usePerformanceMetrics = () => useAppStore((state) => state.performanceMetrics)

// 动作 hooks
export const useAppActions = () => useAppStore((state) => ({
  updatePreferences: state.updatePreferences,
  recordAppUsage: state.recordAppUsage,
  toggleFavorite: state.toggleFavorite,
  isFavorite: state.isFavorite,
  setAppState: state.setAppState,
  getAppState: state.getAppState,
  addToSearchHistory: state.addToSearchHistory,
  clearSearchHistory: state.clearSearchHistory,
  recordPerformance: state.recordPerformance,
  resetAll: state.resetAll
}))