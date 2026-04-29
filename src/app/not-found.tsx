'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Heart, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Heart className="h-16 w-16 text-pink-500 fill-pink-500" />
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              页面未找到
            </CardTitle>
            <CardDescription className="text-gray-600">
              抱歉，您访问的页面不存在或已被移动
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p>可能的原因：</p>
              <ul className="text-left mt-2 space-y-1">
                <li>• URL 地址输入错误</li>
                <li>• 页面已被删除或移动</li>
                <li>• 链接已过期</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Home className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              
              <Link href="/apps">
                <Button variant="outline" className="w-full sm:w-auto border-pink-500 text-pink-600 hover:bg-pink-50">
                  <Search className="h-4 w-4 mr-2" />
                  应用中心
                </Button>
              </Link>
            </div>
            
            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>圆聚助残平台 - 供残捐 · 益企捐</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}