/**
 * 助残众筹平台核心系统集成
 * 将错误封装器、奖励器和突触系统集成到现有平台中
 */

import { ErrorContainer } from '../error/container'
import { RewardContainer } from '../reward/container'
import { SynapseContainer } from '../synapse/container'

export class PlatformCoreIntegration {
  private errorContainer: ErrorContainer
  private rewardContainer: RewardContainer
  private synapseContainer: SynapseContainer

  constructor() {
    this.errorContainer = ErrorContainer.getInstance()
    this.rewardContainer = RewardContainer.getInstance()
    this.synapseContainer = SynapseContainer.getInstance()
    this.initializeIntegrations()
  }

  /**
   * 初始化系统集成
   */
  private initializeIntegrations(): void {
    // 设置应用间连接
    this.setupApplicationConnections()
    
    // 注册信号处理器
    this.registerSignalHandlers()
    
    // 配置奖励规则
    this.configureRewardRules()
  }

  /**
   * 设置应用间连接
   */
  private setupApplicationConnections(): void {
    // 前端到API的连接
    this.synapseContainer.connect('frontend', 'api', {
      type: 'sync',
      reliability: 'at_least_once',
      encoding: 'json',
      compression: true,
      encryption: false
    })

    // API到数据库的连接
    this.synapseContainer.connect('api', 'database', {
      type: 'sync',
      reliability: 'exactly_once',
      encoding: 'json',
      compression: false,
      encryption: true
    })

    // API到通知服务的连接
    this.synapseContainer.connect('api', 'notification', {
      type: 'async',
      reliability: 'at_least_once',
      encoding: 'json',
      compression: true,
      encryption: false
    })
  }

  /**
   * 注册信号处理器
   */
  private registerSignalHandlers(): void {
    // 注册项目创建处理器
    this.synapseContainer.receiver.registerHandler({
      appId: 'api',
      channel: 'project_created',
      handler: async (signal) => {
        return await this.handleProjectCreated(signal)
      },
      priority: 10,
      enabled: true
    })

    // 注册捐款处理器
    this.synapseContainer.receiver.registerHandler({
      appId: 'api',
      channel: 'donation_made',
      handler: async (signal) => {
        return await this.handleDonationMade(signal)
      },
      priority: 9,
      enabled: true
    })
  }

  /**
   * 配置奖励规则
   */
  private configureRewardRules(): void {
    // 创建项目奖励区域
    this.rewardContainer.createRewardZone('project_creation', [
      {
        condition: (result) => result && result.success === true,
        multiplier: 1.5,
        type: 'success'
      },
      {
        condition: (result) => result && result.processingTime < 1000,
        multiplier: 1.2,
        type: 'performance'
      }
    ])

    // 捐款奖励区域
    this.rewardContainer.createRewardZone('donation_processing', [
      {
        condition: (result) => result && result.amount > 0,
        multiplier: 1.3,
        type: 'success'
      },
      {
        condition: (result) => result && result.repeatDonor === false,
        multiplier: 1.4,
        type: 'quality'
      }
    ])
  }

  /**
   * 安全的项目创建API包装器
   */
  async createProjectSafely(projectData: any): Promise<any> {
    return this.errorContainer.wrap(
      async () => {
        // 使用奖励器增强项目创建
        return this.rewardContainer.reward(
          async () => {
            // 发送项目创建信号
            const connection = this.synapseContainer.connect('frontend', 'api', {
              type: 'sync',
              reliability: 'exactly_once',
              encoding: 'json',
              compression: true,
              encryption: false
            })

            const signal = {
              id: `project_create_${Date.now()}`,
              type: 'create_project',
              source: 'frontend',
              target: 'api',
              payload: projectData,
              metadata: {
                priority: 8,
                timestamp: new Date(),
                correlationId: `tx_${Date.now()}`
              }
            }

            const response = await this.synapseContainer.transmit(connection, signal)
            
            if (response.status !== 'success') {
              throw new Error(response.error || '项目创建失败')
            }

            return response.payload
          },
          'project_creation',
          { multiplier: 1.5, persist: true }
        )
      },
      'create_project_api',
      { retry: 2, timeout: 15000, fallback: null }
    )
  }

  /**
   * 安全的捐款处理API包装器
   */
  async processDonationSafely(donationData: any): Promise<any> {
    return this.errorContainer.wrap(
      async () => {
        // 使用奖励器增强捐款处理
        return this.rewardContainer.reward(
          async () => {
            // 发送捐款信号
            const connection = this.synapseContainer.connect('frontend', 'api', {
              type: 'sync',
              reliability: 'exactly_once',
              encoding: 'json',
              compression: false,
              encryption: true
            })

            const signal = {
              id: `donation_${Date.now()}`,
              type: 'process_donation',
              source: 'frontend',
              target: 'api',
              payload: donationData,
              metadata: {
                priority: 10,
                timestamp: new Date(),
                correlationId: `donation_${Date.now()}`
              }
            }

            const response = await this.synapseContainer.transmit(connection, signal)
            
            if (response.status !== 'success') {
              throw new Error(response.error || '捐款处理失败')
            }

            return response.payload
          },
          'donation_processing',
          { multiplier: 1.8, persist: true }
        )
      },
      'donation_processing_api',
      { retry: 3, timeout: 10000, fallback: null }
    )
  }

  /**
   * 处理项目创建信号
   */
  private async handleProjectCreated(signal: any): Promise<any> {
    return this.errorContainer.wrap(
      async () => {
        console.log('📝 处理项目创建信号:', signal.id)
        
        // 模拟项目创建逻辑
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 发送通知信号
        await this.sendNotificationSignal({
          type: 'project_created_notification',
          recipient: signal.payload.creatorId,
          projectId: signal.payload.id,
          message: '项目创建成功！'
        })

        return {
          success: true,
          projectId: signal.payload.id,
          processedAt: new Date()
        }
      },
      'handle_project_created',
      { fallback: { success: false, error: '处理失败' } }
    )
  }

  /**
   * 处理捐款信号
   */
  private async handleDonationMade(signal: any): Promise<any> {
    return this.errorContainer.wrap(
      async () => {
        console.log('💰 处理捐款信号:', signal.id)
        
        // 模拟捐款处理逻辑
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 发送确认通知
        await this.sendNotificationSignal({
          type: 'donation_confirmation',
          recipient: signal.payload.donorId,
          projectId: signal.payload.projectId,
          amount: signal.payload.amount,
          message: '捐款成功！感谢您的支持！'
        })

        // 给项目创建者发送通知
        await this.sendNotificationSignal({
          type: 'new_donation_notification',
          recipient: signal.payload.projectCreatorId,
          projectId: signal.payload.projectId,
          amount: signal.payload.amount,
          donorName: signal.payload.donorName,
          message: '您的项目收到了新的捐款！'
        })

        return {
          success: true,
          donationId: signal.payload.id,
          processedAt: new Date()
        }
      },
      'handle_donation_made',
      { fallback: { success: false, error: '捐款处理失败' } }
    )
  }

  /**
   * 发送通知信号
   */
  private async sendNotificationSignal(notificationData: any): Promise<void> {
    try {
      const connection = this.synapseContainer.connect('api', 'notification', {
        type: 'async',
        reliability: 'at_least_once',
        encoding: 'json',
        compression: true,
        encryption: false
      })

      const signal = {
        id: `notification_${Date.now()}`,
        type: 'send_notification',
        source: 'api',
        target: 'notification',
        payload: notificationData,
        metadata: {
          priority: 5,
          timestamp: new Date()
        }
      }

      await this.synapseContainer.transmit(connection, signal)
    } catch (error) {
      // 通知发送失败不应该影响主流程
      console.error('通知发送失败:', error)
    }
  }

  /**
   * 获取平台核心统计
   */
  getPlatformCoreStats(): any {
    return {
      error: this.errorContainer.getStats(),
      reward: this.rewardContainer.getStats(),
      synapse: this.synapseContainer.getStats(),
      timestamp: new Date()
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // 测试错误封装器
      const errorTest = await this.errorContainer.wrap(
        () => 'healthy',
        'health_check',
        { timeout: 1000 }
      )

      // 测试奖励器
      const rewardTest = await this.rewardContainer.reward(
        () => 'healthy',
        'health_check'
      )

      // 测试突触系统
      const synapseTest = await this.synapseContainer.transmit(
        this.synapseContainer.connect('system', 'health', {
          type: 'sync',
          reliability: 'best_effort',
          encoding: 'json',
          compression: false,
          encryption: false
        }),
        {
          id: 'health_check',
          type: 'ping',
          source: 'system',
          target: 'health',
          payload: { timestamp: new Date() },
          metadata: {
            priority: 1,
            timestamp: new Date()
          }
        }
      )

      const allHealthy = errorTest === 'healthy' && 
                        rewardTest === 'healthy' && 
                        synapseTest.status === 'success'

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          errorContainer: errorTest === 'healthy',
          rewardContainer: rewardTest === 'healthy',
          synapseContainer: synapseTest.status === 'success',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        }
      }
    }
  }
}

// 导出集成类
export default PlatformCoreIntegration