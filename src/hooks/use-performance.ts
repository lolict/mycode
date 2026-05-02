'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  reRenderCount: number
  memoryUsage: number
}

export function usePerformance(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(Date.now())
  const metrics = useRef<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    reRenderCount: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    renderCount.current += 1
    const renderTime = Date.now() - startTime.current
    
    metrics.current = {
      renderTime,
      componentCount: document.querySelectorAll('*').length,
      reRenderCount: renderCount.current,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [${componentName}] Performance:`, metrics.current)
    }

    startTime.current = Date.now()
  })

  const measureOperation = useCallback(<T>(operation: () => T, operationName: string): T => {
    const start = performance.now()
    const result = operation()
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ [${componentName}] ${operationName}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }, [componentName])

  return {
    metrics: metrics.current,
    measureOperation,
    renderCount: renderCount.current
  }
}