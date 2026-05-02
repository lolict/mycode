'use client'

import { AppMarket } from '@/components/modular/AppMarket'
import { ModuleRegistryProvider } from '@/components/modular/ModuleRegistry'

export default function MarketPage() {
  const handleInstall = (template: any) => {
    console.log('Installing template:', template)
    // 这里可以添加安装逻辑
  }

  const handlePreview = (template: any) => {
    console.log('Previewing template:', template)
    // 预览逻辑已在组件内部处理
  }

  return (
    <ModuleRegistryProvider>
      <AppMarket 
        onInstall={handleInstall}
        onPreview={handlePreview}
      />
    </ModuleRegistryProvider>
  )
}