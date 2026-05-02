/**
 * 核心系统使用示例
 * 展示如何在助残众筹平台中使用错误封装器、奖励器和突触系统
 */

import { PlatformCoreIntegration } from './src/core/integration/platform-integration'

// 初始化核心系统集成
const coreIntegration = new PlatformCoreIntegration()

// 示例1: 安全的项目创建
async function createProjectExample() {
  console.log('🚀 创建项目示例')
  
  const projectData = {
    title: '助残项目测试',
    description: '这是一个测试项目',
    targetAmount: 10000,
    endDate: '2025-12-31',
    creatorId: 'user_001'
  }

  try {
    const result = await coreIntegration.createProjectSafely(projectData)
    console.log('✅ 项目创建成功:', result)
  } catch (error) {
    console.log('❌ 项目创建失败:', error)
  }
}

// 示例2: 安全的捐款处理
async function processDonationExample() {
  console.log('💰 捐款处理示例')
  
  const donationData = {
    projectId: 'project_001',
    donorId: 'user_002',
    amount: 100,
    message: '支持公益事业！'
  }

  try {
    const result = await coreIntegration.processDonationSafely(donationData)
    console.log('✅ 捐款处理成功:', result)
  } catch (error) {
    console.log('❌ 捐款处理失败:', error)
  }
}

// 示例3: 系统健康检查
async function healthCheckExample() {
  console.log('🏥 系统健康检查')
  
  const health = await coreIntegration.healthCheck()
  console.log('系统状态:', health.status)
  console.log('详细信息:', health.details)
}

// 示例4: 获取核心统计
function getStatsExample() {
  console.log('📊 核心系统统计')
  
  const stats = coreIntegration.getPlatformCoreStats()
  console.log('错误封装器统计:', stats.error)
  console.log('奖励器统计:', stats.reward)
  console.log('突触系统统计:', stats.synapse)
}

// 运行所有示例
async function runExamples() {
  console.log('🎯 核心系统使用示例\n')
  
  await createProjectExample()
  console.log('')
  
  await processDonationExample()
  console.log('')
  
  await healthCheckExample()
  console.log('')
  
  getStatsExample()
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runExamples().catch(console.error)
}

export {
  createProjectExample,
  processDonationExample,
  healthCheckExample,
  getStatsExample,
  runExamples
}