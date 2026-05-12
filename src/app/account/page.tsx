'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, TrendingUp, Shield, Users, Building, User } from 'lucide-react'

interface CommunityAccount {
  id: string
  accountType: string
  amount: number
  reason: string
  projectId?: string
  transactionType: string
  createdAt: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  userType: string
  communityBalance: number
  investmentPoints: number
  shelterLevel: number
  communityAccounts: CommunityAccount[]
}

export default function AccountPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // 获取第一个用户作为示例
      const response = await fetch('/api/users/demo')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'disabled':
        return '残疾人用户'
      case 'able-bodied':
        return '健全人用户'
      case 'enterprise':
        return '企业用户'
      default:
        return '普通用户'
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'disabled':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'able-bodied':
        return <User className="h-5 w-5 text-blue-500" />
      case 'enterprise':
        return <Building className="h-5 w-5 text-purple-500" />
      default:
        return <Users className="h-5 w-5 text-gray-500" />
    }
  }

  const getAccountTypeLabel = (accountType: string) => {
    switch (accountType) {
      case 'balance':
        return '共同体账户余额'
      case 'investment':
        return '未来股权投资点数'
      case 'shelter':
        return '倾斜庇佑记录'
      default:
        return '其他'
    }
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'balance':
        return <Shield className="h-4 w-4 text-green-500" />
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'shelter':
        return <Heart className="h-4 w-4 text-pink-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">用户信息加载失败</p>
          <Button onClick={fetchUserProfile} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            {getUserTypeIcon(userProfile.userType)}
            <div>
              <h1 className="text-3xl font-bold">残健共同体账户</h1>
              <p className="text-pink-100">新天枰倾斜公益平台</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-300" />
                  <span className="text-green-100">共同体账户余额</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatAmount(userProfile.communityBalance)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">未来股权投资点数</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {userProfile.investmentPoints.toFixed(1)} 点
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-pink-300" />
                  <span className="text-pink-100">倾斜庇佑等级</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  Level {userProfile.shelterLevel}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 用户信息卡片 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getUserTypeIcon(userProfile.userType)}
                  用户信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">姓名</label>
                  <p className="text-lg font-semibold">{userProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">邮箱</label>
                  <p className="text-sm">{userProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">用户类型</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                      {getUserTypeLabel(userProfile.userType)}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">用户权益说明</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    {userProfile.userType === 'able-bodied' && (
                      <>
                        <p>• 通过帮扶获得未来股权投资机会</p>
                        <p>• 投资点数可兑换未来项目股权</p>
                        <p>• 享受新天枰倾斜政策红利</p>
                      </>
                    )}
                    {userProfile.userType === 'disabled' && (
                      <>
                        <p>• 获得残健共同体账户余额庇佑</p>
                        <p>• 享受倾斜优先级扶持</p>
                        <p>• 参与联建项目收益分配</p>
                      </>
                    )}
                    {userProfile.userType === 'enterprise' && (
                      <>
                        <p>• 获得企业税务减免</p>
                        <p>• 提升企业名誉权和品牌形象</p>
                        <p>• 履行社会责任获得政策支持</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 账户明细 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>账户明细</CardTitle>
                <CardDescription>
                  残健共同体账户的所有变动记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="balance">余额</TabsTrigger>
                    <TabsTrigger value="investment">投资</TabsTrigger>
                    <TabsTrigger value="shelter">庇佑</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userProfile.communityAccounts.map((account) => (
                        <div key={account.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {getAccountTypeIcon(account.accountType)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{getAccountTypeLabel(account.accountType)}</span>
                              <Badge variant={account.transactionType === 'credit' ? 'default' : 'secondary'}>
                                {account.transactionType === 'credit' ? '增加' : '减少'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{account.reason}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(account.createdAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              account.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {account.transactionType === 'credit' ? '+' : '-'}
                              {account.accountType === 'investment' 
                                ? `${account.amount.toFixed(1)} 点` 
                                : formatAmount(account.amount)
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="balance" className="mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userProfile.communityAccounts
                        .filter(account => account.accountType === 'balance')
                        .map((account) => (
                          <div key={account.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {getAccountTypeIcon(account.accountType)}
                            <div className="flex-1">
                              <p className="font-medium">共同体账户余额</p>
                              <p className="text-sm text-gray-600">{account.reason}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(account.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                account.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {account.transactionType === 'credit' ? '+' : '-'}
                                {formatAmount(account.amount)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="investment" className="mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userProfile.communityAccounts
                        .filter(account => account.accountType === 'investment')
                        .map((account) => (
                          <div key={account.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {getAccountTypeIcon(account.accountType)}
                            <div className="flex-1">
                              <p className="font-medium">未来股权投资点数</p>
                              <p className="text-sm text-gray-600">{account.reason}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(account.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                account.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {account.transactionType === 'credit' ? '+' : '-'}
                                {account.amount.toFixed(1)} 点
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="shelter" className="mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userProfile.communityAccounts
                        .filter(account => account.accountType === 'shelter')
                        .map((account) => (
                          <div key={account.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {getAccountTypeIcon(account.accountType)}
                            <div className="flex-1">
                              <p className="font-medium">倾斜庇佑记录</p>
                              <p className="text-sm text-gray-600">{account.reason}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(account.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                account.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {account.transactionType === 'credit' ? '+' : '-'}
                                {formatAmount(account.amount)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}