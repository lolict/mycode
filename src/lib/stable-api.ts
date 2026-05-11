// 稳定的API包装器，处理所有错误情况
class StableAPI {
  private baseURL: string
  private retryCount: number = 3
  private timeout: number = 10000

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retryCount: number = this.retryCount): Promise<Response> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return response
    } catch (error) {
      if (retryCount > 0 && error instanceof Error && error.name !== 'AbortError') {
        console.warn(`API请求失败，重试中... 剩余次数: ${retryCount - 1}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.fetchWithRetry(url, options, retryCount - 1)
      }
      throw error
    }
  }

  async get(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(this.baseURL + endpoint, window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    try {
      const response = await this.fetchWithRetry(url.toString())
      return await response.json()
    } catch (error) {
      console.error('GET请求失败:', endpoint, error)
      throw this.handleError(error, endpoint)
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await this.fetchWithRetry(this.baseURL + endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('POST请求失败:', endpoint, error)
      throw this.handleError(error, endpoint)
    }
  }

  private handleError(error: any, endpoint: string): Error {
    if (error.name === 'AbortError') {
      return new Error('请求超时，请检查网络连接')
    }

    if (error.message.includes('Failed to fetch')) {
      return new Error('网络连接失败，请检查网络设置')
    }

    if (error.message.includes('HTTP 404')) {
      return new Error('请求的资源不存在')
    }

    if (error.message.includes('HTTP 500')) {
      return new Error('服务器内部错误，请稍后重试')
    }

    if (error.message.includes('HTTP 400')) {
      return new Error('请求参数错误')
    }

    return new Error(`请求失败: ${error.message}`)
  }

  // 专门的项目相关API
  async getProjects(params: { featured?: boolean; limit?: number; page?: number } = {}) {
    return this.get('/api/projects', params)
  }

  async getProject(id: string) {
    return this.get(`/api/projects/${id}`)
  }

  async createProject(data: any) {
    return this.post('/api/projects', data)
  }

  async donateToProject(projectId: string, data: { amount: number; message?: string; anonymous?: boolean }) {
    return this.post(`/api/projects/${projectId}/donate`, data)
  }

  async getProjectDonations(projectId: string) {
    return this.get(`/api/projects/${projectId}/donations`)
  }

  async getProjectComments(projectId: string) {
    return this.get(`/api/projects/${projectId}/comments`)
  }

  async addComment(projectId: string, data: { content: string; authorId: string }) {
    return this.post(`/api/projects/${projectId}/comments`, data)
  }

  // 统计API
  async getStats() {
    return this.get('/api/stats')
  }

  // 记名账本API
  async getLedgerEntries() {
    return this.get('/api/ledger')
  }

  async createLedgerEntry(data: any) {
    return this.post('/api/ledger', data)
  }
}

// 创建全局API实例
export const stableAPI = new StableAPI()

// 导出类型
export interface Project {
  id: string
  title: string
  description: string
  content: string
  targetAmount: number
  currentAmount: number
  status: string
  endDate: string
  location?: string
  organizer?: string
  contact?: string
  category?: {
    id: string
    name: string
  }
  creator?: {
    id: string
    name: string
  }
  donorCount: number
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  amount: number
  message?: string
  anonymous: boolean
  projectId: string
  donorId: string
  donor?: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  projectId: string
  authorId: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

export interface Stats {
  totalProjects: number
  totalAmount: number
  totalDonors: number
  successRate: number
}

export default StableAPI