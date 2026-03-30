/**
 * 协作同步管理器（WebSocket）
 * 通过 WebSocket 连接协作服务，实现跨设备/跨网络的实时同步。
 *
 * 协议约定：
 * - 客户端发送/接收的消息都带有 type。
 * - broadcast(data) 会自动补齐 fromInstance 与 timestamp。
 * - on('connected'|'disconnected', cb) 可监听连接状态。
 */

class SyncManager {
  constructor(url) {
    this.ws = null
    this.url = url || this.resolveUrl()
    this.listeners = new Map()
    this.instanceId = 'tab_' + Math.random().toString(36).substr(2, 9)

    this._destroyed = false
    this._reconnectAttempts = 0
    this._reconnectTimer = null
    this._queue = []

    this.connect()
  }

  resolveUrl() {
    const envUrl = import.meta?.env?.VITE_WS_URL
    if (envUrl) return envUrl

    // 默认推断：
    // - 生产/自定义端口（如 Nginx :8055）：优先走同源 /ws（方便 Nginx 反代，不额外暴露 1234）
    // - 开发（Vite 常见端口 3000/5173）：走同 host 的 1234 端口
    if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const hostname = window.location.hostname
      const port = window.location.port
      const isViteDevPort = port === '3000' || port === '5173'
      if (isViteDevPort) return `${protocol}//${hostname}:1234`

      const hostWithPort = window.location.host
      return `${protocol}//${hostWithPort}/ws`
    }

    return 'ws://localhost:1234'
  }

  connect() {
    if (this._destroyed) return
    if (!this.url) return

    try {
      this.ws = new WebSocket(this.url)
    } catch (error) {
      console.error('[SyncManager] 创建 WebSocket 失败:', error)
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this._reconnectAttempts = 0
      this.emitLocal('connected', { url: this.url, instanceId: this.instanceId })
      this.flushQueue()
      console.log(`[SyncManager] WebSocket 已连接: ${this.url}，实例 ID: ${this.instanceId}`)
    }

    this.ws.onmessage = (event) => {
      const data = this.safeParse(event.data)
      if (data) this.handleMessage(data)
    }

    this.ws.onerror = (error) => {
      // onclose 会统一处理重连
      console.warn('[SyncManager] WebSocket 错误:', error)
    }

    this.ws.onclose = () => {
      if (this._destroyed) return
      this.emitLocal('disconnected', { url: this.url, instanceId: this.instanceId })
      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (this._destroyed) return
    if (this._reconnectTimer) return

    const attempt = Math.min(this._reconnectAttempts + 1, 10)
    this._reconnectAttempts = attempt
    const delay = Math.min(500 * attempt, 5000)

    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      this.connect()
    }, delay)
  }

  safeParse(raw) {
    try {
      if (typeof raw === 'string') return JSON.parse(raw)
      // WebSocket message can be Blob/ArrayBuffer
      return JSON.parse(String(raw))
    } catch {
      return null
    }
  }

  flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    while (this._queue.length) {
      const payload = this._queue.shift()
      try {
        this.ws.send(payload)
      } catch {
        // 如果发送失败，把剩余的放回去，等待下次重连
        this._queue.unshift(payload)
        break
      }
    }
  }

  /**
   * 广播消息到协作服务（由服务端转发给其他客户端）
   */
  broadcast(data) {
    try {
      const message = {
        ...data,
        fromInstance: this.instanceId,
        timestamp: Date.now()
      }
      const payload = JSON.stringify(message)
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(payload)
      } else {
        this._queue.push(payload)
      }
    } catch (error) {
      console.error('[SyncManager] 广播消息失败:', error, data)
    }
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    // 忽略自己发送的消息
    if (data.fromInstance === this.instanceId) {
      return
    }

    const listeners = this.listeners.get(data.type) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('[SyncManager] 消息处理错误:', error)
      }
    })
  }

  /**
   * 注册消息监听器
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  emitLocal(type, data) {
    const listeners = this.listeners.get(type) || []
    listeners.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error('[SyncManager] 本地事件处理错误:', error)
      }
    })
  }

  /**
   * 移除消息监听器
   */
  off(type, callback) {
    const listeners = this.listeners.get(type) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  /**
   * 销毁同步管理器
   */
  destroy() {
    this._destroyed = true
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        // ignore
      }
      this.ws = null
    }
    this.listeners.clear()
    console.log(`[SyncManager] 已销毁，实例 ID: ${this.instanceId}`)
  }

  /**
   * 请求同步数据
   */
  requestSync() {
    this.broadcast({
      type: 'sync_request',
      instanceId: this.instanceId
    })
  }

  /**
   * 响应同步请求
   */
  respondSync(data) {
    // WebSocket 模式下通常由服务端响应 sync_request。
    // 为兼容旧接口保留此方法（需要时也可由客户端主动推送快照）。
    this.broadcast({ type: 'sync_response', data })
  }
}

export default SyncManager
