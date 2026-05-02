/**
 * 核心系统集成演示
 * 展示错误封装器、正确奖励器和神经突触系统的协同工作
 */

import { ErrorContainer } from '../error/container'
import { RewardContainer } from '../reward/container'
import { SynapseContainer } from '../synapse/container'

export class CoreSystemDemo {
  private errorContainer: ErrorContainer
  private rewardContainer: RewardContainer
  private synapseContainer: SynapseContainer

  constructor() {
    this.errorContainer = ErrorContainer.getInstance()
    this.rewardContainer = RewardContainer.getInstance()
    this.synapseContainer = SynapseContainer.getInstance()
  }

  /**
   * 演示完整的系统集成
   */
  async demonstrate(): Promise<void> {
    console.log('🚀 启动核心系统集成演示\n')

    try {
      // 1. 演示错误封装器
      await this.demonstrateErrorContainer()
      
      // 2. 演示正确奖励器
      await this.demonstrateRewardContainer()
      
      // 3. 演示神经突触系统
      await this.demonstrateSynapseContainer()
      
      // 4. 演示系统集成
      await this.demonstrateIntegration()
      
      // 5. 显示统计信息
      this.displayStats()
      
    } catch (error) {
      console.error('演示过程中发生错误:', error)
    }
  }

  /**
   * 演示错误封装器
   */
  private async demonstrateErrorContainer(): Promise<void> {
    console.log('🛡️  错误封装器演示')
    console.log('==================')

    // 成功案例
    const successResult = await this.errorContainer.wrap(
      () => {
        console.log('✅ 执行成功操作')
        return '操作成功'
      },
      'demo_success_operation'
    )
    console.log('结果:', successResult)

    // 错误案例（被封装）
    const errorResult = await this.errorContainer.wrap(
      () => {
        console.log('❌ 执行失败操作')
        throw new Error('这是一个测试错误')
      },
      'demo_error_operation',
      { fallback: '错误被安全处理' }
    )
    console.log('结果:', errorResult)
    console.log('✅ 错误已被封装，无法逃出\n')
  }

  /**
   * 演示正确奖励器
   */
  private async demonstrateRewardContainer(): Promise<void> {
    console.log('🎯 正确奖励器演示')
    console.log('==================')

    // 成功操作获得奖励
    const rewardResult = await this.rewardContainer.reward(
      () => {
        console.log('🎉 执行优秀操作')
        return { data: '优秀结果', quality: 'high' }
      },
      'demo_excellent_operation',
      { multiplier: 1.5, persist: true }
    )
    console.log('结果:', rewardResult)

    // 普通操作
    const normalResult = await this.rewardContainer.reward(
      () => {
        console.log('⚡ 执行普通操作')
        return { data: '普通结果' }
      },
      'demo_normal_operation'
    )
    console.log('结果:', normalResult)
    console.log('✅ 正确行为已获得奖励\n')
  }

  /**
   * 演示神经突触系统
   */
  private async demonstrateSynapseContainer(): Promise<void> {
    console.log('🔗 神经突触系统演示')
    console.log('====================')

    // 创建应用间连接
    const connection = this.synapseContainer.connect(
      'app_a',
      'app_b',
      {
        type: 'sync',
        reliability: 'at_least_once',
        encoding: 'json',
        compression: true,
        encryption: false
      }
    )
    console.log('✅ 创建连接:', connection.id)

    // 传输信号
    const signal = {
      id: 'demo_signal_001',
      type: 'data_transfer',
      source: 'app_a',
      target: 'app_b',
      payload: { message: 'Hello from App A!' },
      metadata: {
        priority: 5,
        timestamp: new Date()
      }
    }

    const response = await this.synapseContainer.transmit(connection, signal)
    console.log('✅ 信号传输结果:', response.status)
    console.log('✅ 应用间通信成功\n')
  }

  /**
   * 演示系统集成
   */
  private async demonstrateIntegration(): Promise<void> {
    console.log('🔄 系统集成演示')
    console.log('================')

    // 创建一个完整的业务流程，展示三个系统协同工作
    await this.processBusinessTransaction()
  }

  /**
   * 处理业务事务（完整集成示例）
   */
  private async processBusinessTransaction(): Promise<void> {
    console.log('📊 处理业务事务...')

    // 使用错误封装器保护整个事务
    const result = await this.errorContainer.wrap(
      async () => {
        // 步骤1: 数据验证（使用奖励器）
        const validationResult = await this.rewardContainer.reward(
          () => this.validateBusinessData(),
          'data_validation',
          { multiplier: 1.2 }
        )

        if (!validationResult) {
          throw new Error('数据验证失败')
        }

        // 步骤2: 应用间通信（使用突触系统）
        const connection = this.synapseContainer.connect(
          'business_app',
          'data_processor',
          {
            type: 'sync',
            reliability: 'exactly_once',
            encoding: 'json',
            compression: false,
            encryption: true
          }
        )

        const processResponse = await this.synapseContainer.transmit(
          connection,
          {
            id: 'business_tx_001',
            type: 'process_data',
            source: 'business_app',
            target: 'data_processor',
            payload: { data: validationResult, operation: 'process' },
            metadata: {
              priority: 8,
              timestamp: new Date(),
              correlationId: 'tx_001'
            }
          }
        )

        if (processResponse.status !== 'success') {
          throw new Error('数据处理失败')
        }

        // 步骤3: 结果处理（使用奖励器）
        const finalResult = await this.rewardContainer.reward(
          () => this.processResult(processResponse.payload),
          'result_processing',
          { multiplier: 1.8, persist: true }
        )

        return finalResult
      },
      'business_transaction',
      { retry: 2, timeout: 10000 }
    )

    console.log('✅ 业务事务处理结果:', result)
  }

  /**
   * 验证业务数据
   */
  private validateBusinessData(): any {
    // 模拟数据验证
    return {
      id: 'data_001',
      valid: true,
      timestamp: new Date(),
      quality: 'high'
    }
  }

  /**
   * 处理结果
   */
  private processResult(payload: any): any {
    // 模拟结果处理
    return {
      processed: true,
      data: payload,
      timestamp: new Date(),
      status: 'completed'
    }
  }

  /**
   * 显示统计信息
   */
  private displayStats(): void {
    console.log('\n📈 系统统计信息')
    console.log('================')

    // 错误封装器统计
    const errorStats = this.errorContainer.getStats()
    console.log('🛡️  错误封装器:')
    console.log(`   - 边界守护: ${errorStats.boundaries.totalGuards} 次`)
    console.log(`   - 错误捕获: ${errorStats.traps.totalCaptures} 次`)
    console.log(`   - 错误隔离: ${errorStats.isolators.totalIsolations} 次`)

    // 奖励器统计
    const rewardStats = this.rewardContainer.getStats()
    console.log('🎯 正确奖励器:')
    console.log(`   - 边界增强: ${rewardStats.boundaries.totalEnhancements} 次`)
    console.log(`   - 成功奖励: ${rewardStats.boundaries.successfulRewards} 次`)
    console.log(`   - 奖励分发: ${rewardStats.distributors.totalDistributions} 次`)

    // 突触系统统计
    const synapseStats = this.synapseContainer.getStats()
    console.log('🔗 神经突触系统:')
    console.log(`   - 活跃连接: ${synapseStats.boundary.activeConnections} 个`)
    console.log(`   - 信号传输: ${synapseStats.transmitter.totalTransmissions} 次`)
    console.log(`   - 信号接收: ${synapseStats.receiver.totalReceived} 次`)
    console.log(`   - 信号路由: ${synapseStats.router.totalRoutes} 次`)

    console.log('\n🎉 核心系统集成演示完成！')
    console.log('✅ 所有系统协同工作正常')
  }
}

// 导出演示类
export default CoreSystemDemo

// 如果直接运行此文件，执行演示
if (require.main === module) {
  const demo = new CoreSystemDemo()
  demo.demonstrate().catch(console.error)
}