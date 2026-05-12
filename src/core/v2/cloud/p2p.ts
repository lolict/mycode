/**
 * P2P 数据层 — WebRTC 浏览器直连
 *
 * 没有服务器也能实时通信！
 * WebRTC 让两个浏览器直接对话，不需要中间服务器转发数据。
 *
 * 但是 WebRTC 需要一个"信令服务器"来交换连接信息（SDP）。
 * 我们用 GitHub/Gitee 来做信令——把连接信息存到仓库里，
 * 对方从仓库读取，然后建立直连。
 *
 * 流程：
 * 1. A 想连接 B → A 创建 Offer → 存到 GitHub → 通知 B
 * 2. B 读取 Offer → B 创建 Answer → 存到 GitHub → 通知 A
 * 3. A 读取 Answer → 双方建立 P2P 直连 → 不再需要 GitHub
 * 4. 直连后可以实时传数据，速度极快，不经过任何服务器
 *
 * 这就是 D3D/D4D 的"第三滴"——设备间直接连线。
 */

export interface P2PPeer {
  id: string
  name: string
  connection?: RTCPeerConnection
  dataChannel?: RTCDataChannel
  status: 'connecting' | 'connected' | 'disconnected' | 'failed'
}

export interface P2PMessage {
  type: 'signal' | 'data' | 'heartbeat'
  from: string
  to: string
  payload: any
  timestamp: number
}

// ICE 服务器配置（STUN/TURN）— STUN免费，TURN收费
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // 免费的 STUN 服务器，用于 NAT 穿透
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // 如果有 TURN 服务器（收费但更可靠），可以加在这里
    // { urls: 'turn:turn.example.com', username: 'xxx', credential: 'xxx' },
  ],
}

type P2PEventHandler = (event: string, data: any) => void

class P2PLayer {
  private peers: Map<string, P2PPeer> = new Map()
  private localId: string
  private signalingWrite: ((data: any) => Promise<void>) | null = null
  private signalingRead: (() => Promise<any[]>) | null = null
  private eventHandlers: Map<string, Set<P2PEventHandler>> = new Map()
  private heartbeatIntervalId: NodeJS.Timeout | null = null

  constructor() {
    this.localId = `peer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  /**
   * 获取本地节点ID
   */
  getLocalId(): string {
    return this.localId
  }

  /**
   * 配置信令通道 — 用 GitHub 仓库交换连接信息
   *
   * signalingWrite: 把信号写到云端
   * signalingRead: 从云端读取信号
   */
  configureSignaling(
    write: (data: any) => Promise<void>,
    read: () => Promise<any[]>
  ): void {
    this.signalingWrite = write
    this.signalingRead = read
  }

  /**
   * 连接到远程节点
   *
   * 通过 GitHub 信令交换 SDP，建立 P2P 直连
   */
  async connectToPeer(peerId: string, peerName: string): Promise<void> {
    if (this.peers.has(peerId)) {
      const existing = this.peers.get(peerId)!
      if (existing.status === 'connected') return
    }

    const peer: P2PPeer = {
      id: peerId,
      name: peerName,
      status: 'connecting',
    }
    this.peers.set(peerId, peer)

    // 创建 RTCPeerConnection
    const connection = new RTCPeerConnection(ICE_SERVERS)
    peer.connection = connection

    // 创建数据通道
    const dataChannel = connection.createDataChannel('yuanju-sync', {
      ordered: true,
    })
    peer.dataChannel = dataChannel

    this.setupDataChannel(peerId, dataChannel)

    // 收集 ICE 候选
    const iceCandidates: RTCIceCandidateInit[] = []
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate.toJSON())
      }
    }

    // 创建 Offer
    const offer = await connection.createOffer()
    await connection.setLocalDescription(offer)

    // 等待 ICE 收集完成
    await this.waitForIceGathering(connection)

    // 通过信令通道发送 Offer
    if (this.signalingWrite) {
      await this.signalingWrite({
        type: 'offer',
        from: this.localId,
        to: peerId,
        sdp: connection.localDescription,
        iceCandidates,
        timestamp: Date.now(),
      })
    }

    this.emit('peer:connecting', { peerId, peerName })
  }

  /**
   * 处理收到的信令消息
   */
  async handleSignalingMessage(message: any): Promise<void> {
    // 忽略自己发的消息
    if (message.from === this.localId) return
    // 只处理发给自己的消息
    if (message.to && message.to !== this.localId) return

    switch (message.type) {
      case 'offer':
        await this.handleOffer(message)
        break
      case 'answer':
        await this.handleAnswer(message)
        break
      case 'ice-candidate':
        await this.handleIceCandidate(message)
        break
    }
  }

  /**
   * 发送数据到指定节点
   */
  sendToPeer(peerId: string, data: any): void {
    const peer = this.peers.get(peerId)
    if (!peer?.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn(`节点 ${peerId} 未连接，无法发送数据`)
      return
    }

    peer.dataChannel.send(JSON.stringify({
      type: 'data',
      from: this.localId,
      payload: data,
      timestamp: Date.now(),
    }))
  }

  /**
   * 广播数据到所有连接的节点
   */
  broadcast(data: any): void {
    for (const [peerId] of this.peers) {
      this.sendToPeer(peerId, data)
    }
  }

  /**
   * 获取所有连接的节点
   */
  getConnectedPeers(): Array<{ id: string; name: string; status: string }> {
    return Array.from(this.peers.values()).map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
    }))
  }

  /**
   * 注册事件处理器
   */
  on(event: string, handler: P2PEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)

    return () => {
      this.eventHandlers.get(event)?.delete(handler)
    }
  }

  /**
   * 启动心跳 — 定期向信令通道发送心跳
   */
  startHeartbeat(interval = 30000): void {
    this.stopHeartbeat()
    this.heartbeatIntervalId = setInterval(async () => {
      if (this.signalingWrite) {
        await this.signalingWrite({
          type: 'heartbeat',
          from: this.localId,
          timestamp: Date.now(),
        })
      }
    }, interval)
  }

  /**
   * 停止心跳
   */
  stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId)
      this.heartbeatIntervalId = null
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopHeartbeat()
    for (const [, peer] of this.peers) {
      peer.dataChannel?.close()
      peer.connection?.close()
    }
    this.peers.clear()
  }

  // ============================================
  // 私有方法
  // ============================================

  private async handleOffer(message: any): Promise<void> {
    let peer = this.peers.get(message.from)
    if (!peer) {
      peer = {
        id: message.from,
        name: message.from,
        status: 'connecting',
      }
      this.peers.set(message.from, peer)
    }

    const connection = new RTCPeerConnection(ICE_SERVERS)
    peer.connection = connection

    connection.ondatachannel = (event) => {
      peer!.dataChannel = event.channel
      this.setupDataChannel(message.from, event.channel)
    }

    await connection.setRemoteDescription(new RTCSessionDescription(message.sdp))

    // 添加 ICE 候选
    if (message.iceCandidates) {
      for (const candidate of message.iceCandidates) {
        await connection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    }

    const answer = await connection.createAnswer()
    await connection.setLocalDescription(answer)

    await this.waitForIceGathering(connection)

    if (this.signalingWrite) {
      await this.signalingWrite({
        type: 'answer',
        from: this.localId,
        to: message.from,
        sdp: connection.localDescription,
        timestamp: Date.now(),
      })
    }
  }

  private async handleAnswer(message: any): Promise<void> {
    const peer = this.peers.get(message.from)
    if (!peer?.connection) return

    await peer.connection.setRemoteDescription(new RTCSessionDescription(message.sdp))
  }

  private async handleIceCandidate(message: any): Promise<void> {
    const peer = this.peers.get(message.from)
    if (!peer?.connection) return

    await peer.connection.addIceCandidate(new RTCIceCandidate(message.candidate))
  }

  private setupDataChannel(peerId: string, channel: RTCDataChannel): void {
    channel.onopen = () => {
      const peer = this.peers.get(peerId)
      if (peer) peer.status = 'connected'
      this.emit('peer:connected', { peerId })
    }

    channel.onclose = () => {
      const peer = this.peers.get(peerId)
      if (peer) peer.status = 'disconnected'
      this.emit('peer:disconnected', { peerId })
    }

    channel.onerror = () => {
      const peer = this.peers.get(peerId)
      if (peer) peer.status = 'failed'
      this.emit('peer:error', { peerId })
    }

    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.emit('peer:message', { peerId, message })
      } catch {
        // 非JSON消息忽略
      }
    }
  }

  private waitForIceGathering(connection: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (connection.iceGatheringState === 'complete') {
        resolve()
        return
      }

      const checkState = () => {
        if (connection.iceGatheringState === 'complete') {
          connection.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }
      }

      connection.addEventListener('icegatheringstatechange', checkState)

      // 超时 5 秒
      setTimeout(() => {
        connection.removeEventListener('icegatheringstatechange', checkState)
        resolve()
      }, 5000)
    })
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event, data)
        } catch {
          // 事件处理器失败不影响其他
        }
      }
    }
  }
}

// ============================================
// 全局单例
// ============================================

let instance: P2PLayer | null = null

export function getP2PLayer(): P2PLayer {
  if (!instance) {
    instance = new P2PLayer()
  }
  return instance
}

export { P2PLayer }
