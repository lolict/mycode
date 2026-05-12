'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // 记录错误到监控服务
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo)

    // 发送错误报告（生产环境）
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成错误监控服务，如 Sentry
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">出现了一些问题</CardTitle>
              <CardDescription>
                {this.state.retryCount > 0 
                  ? `第 ${this.state.retryCount} 次重试失败` 
                  : '应用程序遇到了意外错误'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-50 p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium mb-2">错误详情</summary>
                  <pre className="whitespace-pre-wrap text-xs text-red-600 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                {this.state.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重试 ({this.maxRetries - this.state.retryCount})
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  重置
                </Button>
              </div>

              {this.state.retryCount >= this.maxRetries && (
                <div className="text-center text-sm text-gray-600">
                  <p>多次重试失败，请刷新页面或联系技术支持</p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="link"
                    className="mt-2"
                  >
                    刷新页面
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}