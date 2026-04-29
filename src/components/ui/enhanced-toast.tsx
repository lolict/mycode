'use client'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-200 bg-green-50 text-green-800',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800',
        loading: 'border-gray-200 bg-gray-50 text-gray-800'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const toastIcons = {
  default: Info,
  destructive: AlertTriangle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2
}

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  onDismiss?: () => void
  icon?: boolean
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, duration = 5000, onDismiss, icon = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isPaused, setIsPaused] = React.useState(false)
    const [progress, setProgress] = React.useState(100)

    React.useEffect(() => {
      if (duration === 0) return

      const startTime = Date.now()
      let animationFrame: number

      const updateProgress = () => {
        if (!isPaused) {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, duration - elapsed)
          const newProgress = (remaining / duration) * 100
          
          setProgress(newProgress)

          if (newProgress <= 0) {
            handleDismiss()
          } else {
            animationFrame = requestAnimationFrame(updateProgress)
          }
        } else {
          animationFrame = requestAnimationFrame(updateProgress)
        }
      }

      animationFrame = requestAnimationFrame(updateProgress)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }, [duration, isPaused])

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
      setTimeout(() => {
        onDismiss?.()
      }, 300)
    }, [onDismiss])

    const IconComponent = toastIcons[variant || 'default']

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className, {
          'animate-out slide-out-to-right-full fade-out-80': !isVisible,
          'animate-in slide-in-from-top-full sm:slide-in-from-bottom-full': isVisible
        })}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        {...props}
      >
        <div className="grid gap-1">
          {title && (
            <div className="flex items-center gap-2">
              {icon && (
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              )}
              <div className="text-sm font-semibold">{title}</div>
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          aria-label="关闭通知"
        >
          <X className="h-4 w-4" />
        </button>

        {duration > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-100 ease-linear"
               style={{ width: `${progress}%` }}
               aria-hidden="true"
          />
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

interface ToastProviderProps {
  children: React.ReactNode
}

interface ToastItem {
  id: string
  component: React.ReactElement
  duration: number
}

const ToastContext = React.createContext<{
  toast: (props: Omit<ToastProps, 'onDismiss'>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}>({
  toast: () => '',
  dismiss: () => {},
  dismissAll: () => {}
})

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const toastIdRef = React.useRef(0)

  const toast = React.useCallback((props: Omit<ToastProps, 'onDismiss'>) => {
    const id = `toast-${++toastIdRef.current}`
    
    const toastElement = React.createElement(Toast, {
      ...props,
      onDismiss: () => dismiss(id)
    })

    setToasts(prev => [...prev, { id, component: toastElement, duration: props.duration || 5000 }])
    
    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = React.useCallback(() => {
    setToasts([])
  }, [])

  const value = React.useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && 
        ReactDOM.createPortal(
          <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(({ id, component }) => (
              <div key={id} className="mb-2">
                {component}
              </div>
            ))}
          </div>,
          document.body
        )
      }
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// 便捷的 toast 函数
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { toast } = useToast()
    return toast({ title, description, variant: 'success', ...options })
  },
  error: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { toast } = useToast()
    return toast({ title, description, variant: 'destructive', ...options })
  },
  warning: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { toast } = useToast()
    return toast({ title, description, variant: 'warning', ...options })
  },
  info: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { toast } = useToast()
    return toast({ title, description, variant: 'info', ...options })
  },
  loading: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { toast } = useToast()
    return toast({ title, description, variant: 'loading', duration: 0, ...options })
  }
}