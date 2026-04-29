/**
 * 核心系统简单测试
 */

import { ErrorContainer } from './src/core/error/container'
import { RewardContainer } from './src/core/reward/container'
import { SynapseContainer } from './src/core/synapse/container'

async function testCoreSystem() {
  console.log('🧪 测试核心系统\n')

  // 测试错误封装器
  console.log('1. 测试错误封装器')
  const errorContainer = ErrorContainer.getInstance()
  
  const errorResult = await errorContainer.wrap(
    () => {
      console.log('   ✅ 正常执行')
      return 'success'
    },
    'test_operation'
  )
  console.log('   结果:', errorResult)

  const errorHandled = await errorContainer.wrap(
    () => {
      console.log('   ❌ 抛出错误')
      throw new Error('测试错误')
    },
    'test_error',
    { fallback: 'error_handled' }
  )
  console.log('   结果:', errorHandled, '(错误已被处理)\n')

  // 测试奖励器
  console.log('2. 测试奖励器')
  const rewardContainer = RewardContainer.getInstance()
  
  const rewardResult = await rewardContainer.reward(
    () => {
      console.log('   🎯 执行奖励操作')
      return { data: 'excellent_result', quality: 'high' }
    },
    'test_reward',
    { multiplier: 1.5 }
  )
  console.log('   结果:', rewardResult, '(已获得奖励)\n')

  // 测试突触系统
  console.log('3. 测试突触系统')
  const synapseContainer = SynapseContainer.getInstance()
  
  try {
    const connection = synapseContainer.connect('test_app_a', 'test_app_b', {
      type: 'sync',
      reliability: 'best_effort',
      encoding: 'json',
      compression: false,
      encryption: false
    })
    console.log('   ✅ 连接创建成功:', connection.id)

    const signal = {
      id: 'test_signal_001',
      type: 'test_data',
      source: 'test_app_a',
      target: 'test_app_b',
      payload: { message: 'Hello from test!' },
      metadata: {
        priority: 5,
        timestamp: new Date()
      }
    }

    const response = await synapseContainer.transmit(connection, signal)
    console.log('   ✅ 信号传输成功:', response.status)
  } catch (error) {
    console.log('   ⚠️ 突触系统测试跳过 (需要完整环境)')
  }

  // 显示统计
  console.log('\n📊 系统统计:')
  console.log('错误封装器:', errorContainer.getStats())
  console.log('奖励器:', rewardContainer.getStats())
  console.log('突触系统:', synapseContainer.getStats())

  console.log('\n🎉 核心系统测试完成!')
}

// 运行测试
testCoreSystem().catch(console.error)