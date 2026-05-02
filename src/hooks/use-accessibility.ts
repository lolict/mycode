'use client'

import { useEffect, useCallback } from 'react'

export function useAccessibility() {
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    callbacks: {
      onEnter?: () => void
      onEscape?: () => void
      onArrowUp?: () => void
      onArrowDown?: () => void
      onTab?: () => void
    }
  ) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        callbacks.onEnter?.()
        break
      case 'Escape':
        event.preventDefault()
        callbacks.onEscape?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        callbacks.onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        callbacks.onArrowDown?.()
        break
      case 'Tab':
        callbacks.onTab?.()
        break
    }
  }, [])

  useEffect(() => {
    // 检查系统偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    
    return () => {
      // 清理监听器
    }
  }, [])

  return {
    announceToScreenReader,
    handleKeyboardNavigation,
    focusManagement: {
      trapFocus: (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
        
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus()
                e.preventDefault()
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus()
                e.preventDefault()
              }
            }
          }
        }
        
        element.addEventListener('keydown', handleTabKey)
        firstElement?.focus()
        
        return () => {
          element.removeEventListener('keydown', handleTabKey)
        }
      }
    }
  }
}