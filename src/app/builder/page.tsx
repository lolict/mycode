'use client'

import { AppBuilder } from '@/components/modular/AppBuilder'
import { ModuleRegistryProvider } from '@/components/modular/ModuleRegistry'

export default function BuilderPage() {
  const handleSave = (template: any) => {
    console.log('Saving template:', template)
    // 这里可以添加保存逻辑，比如保存到数据库或本地存储
  }

  const handlePreview = (template: any) => {
    console.log('Previewing template:', template)
    // 这里可以添加预览逻辑，比如打开新窗口或模态框
  }

  return (
    <ModuleRegistryProvider>
      <AppBuilder 
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </ModuleRegistryProvider>
  )
}