import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import SyncManager from '@/utils/syncManager'

export const useUserStore = defineStore('user', () => {
  const STORAGE_KEYS = {
    name: 'collab_table_user_name',
    color: 'collab_table_user_color'
  }

  // 同步管理器
  let syncManager = null
  
  // 当前标签页的用户信息
  const currentUser = ref({
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '',
    color: '',
    avatar: '',
    instanceId: '' // 标签页实例ID
  })

  // 所有标签页的用户列表（包括当前标签页）
  const onlineUsers = ref([])

  // 连接状态
  const isConnected = ref(false)

  // 生成随机颜色
  function generateColor() {
    const colors = [
      '#10b981', '#3b82f6', '#8b5cf6', 
      '#ef4444', '#f59e0b', '#14b8a6',
      '#ec4899', '#6366f1', '#f97316'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // ignore
    }
  }

  const initLocalProfile = () => {
    if (!currentUser.value.color) {
      const storedColor = safeGetItem(STORAGE_KEYS.color)
      currentUser.value.color = storedColor || generateColor()
      if (!storedColor) safeSetItem(STORAGE_KEYS.color, currentUser.value.color)
    }

    if (!currentUser.value.name) {
      const storedName = safeGetItem(STORAGE_KEYS.name)
      currentUser.value.name = storedName || ('用户' + Math.floor(Math.random() * 100))
    }
  }

  // 确保用户填写“真实姓名”（保存到本地；用于在线列表与编辑提示）
  const ensureUserName = () => {
    initLocalProfile()

    const storedName = safeGetItem(STORAGE_KEYS.name)
    if (storedName && storedName.trim()) {
      currentUser.value.name = storedName.trim()
      return currentUser.value.name
    }

    if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
      return currentUser.value.name
    }

    const input = window.prompt('请输入你的姓名（将显示给协作中的其他人）', currentUser.value.name || '')
    const name = (input || '').trim()
    if (name) {
      const normalized = name.slice(0, 20)
      currentUser.value.name = normalized
      safeSetItem(STORAGE_KEYS.name, normalized)

      // 如果已经连上服务端，重新发送 hello 更新用户信息
      if (syncManager && isConnected.value) {
        syncManager.broadcast({
          type: 'hello',
          user: {
            id: currentUser.value.id,
            name: currentUser.value.name,
            color: currentUser.value.color,
            avatar: currentUser.value.avatar,
            instanceId: currentUser.value.instanceId
          }
        })
      }
    }

    return currentUser.value.name
  }

  // 初始化同步管理器
  const initSync = () => {
    initLocalProfile()
    if (!syncManager) {
      syncManager = new SyncManager()
      currentUser.value.instanceId = syncManager.instanceId

      // 连接状态
      syncManager.on('connected', () => {
        isConnected.value = true

        // 向服务端登记自己（服务端会下发 user_list + sync_response，并广播 user_online）
        syncManager.broadcast({
          type: 'hello',
          user: {
            id: currentUser.value.id,
            name: currentUser.value.name,
            color: currentUser.value.color,
            avatar: currentUser.value.avatar,
            instanceId: currentUser.value.instanceId
          }
        })
      })

      syncManager.on('disconnected', () => {
        isConnected.value = false
        onlineUsers.value = []
      })
      
      // 服务端下发在线用户列表
      syncManager.on('user_list', (data) => {
        const users = Array.isArray(data.users) ? data.users : []
        // 以 instanceId 去重
        const map = new Map()
        users.forEach(u => {
          if (u && u.instanceId) map.set(u.instanceId, u)
        })
        onlineUsers.value = Array.from(map.values())
      })

      // 监听用户上线
      syncManager.on('user_online', (data) => {
        if (data.user && data.user.instanceId && !onlineUsers.value.find(u => u.instanceId === data.user.instanceId)) {
          onlineUsers.value.push(data.user)
        }
      })

      // 监听用户下线
      syncManager.on('user_offline', (data) => {
        const index = onlineUsers.value.findIndex(u => u.instanceId === data.instanceId)
        if (index > -1) {
          onlineUsers.value.splice(index, 1)
        }
      })
    }
  }

  // 销毁同步管理器
  const destroySync = () => {
    if (syncManager) {
      syncManager.destroy()
      syncManager = null
    }
    isConnected.value = false
    onlineUsers.value = []
  }

  // 设置当前用户信息
  const setCurrentUser = (userInfo) => {
    currentUser.value = { ...currentUser.value, ...userInfo }

    // 仅持久化用户可识别信息
    if (currentUser.value.name) safeSetItem(STORAGE_KEYS.name, currentUser.value.name)
    if (currentUser.value.color) safeSetItem(STORAGE_KEYS.color, currentUser.value.color)
  }

  // 添加在线用户（仅用于模拟，实际由其他标签页广播）
  const addOnlineUser = (user) => {
    const exists = onlineUsers.value.find(u => u.id === user.id)
    if (!exists) {
      onlineUsers.value.push(user)
    }
  }

  // 移除在线用户
  const removeOnlineUser = (userId) => {
    const index = onlineUsers.value.findIndex(u => u.id === userId)
    if (index > -1) {
      onlineUsers.value.splice(index, 1)
    }
  }

  // 更新在线用户列表
  const updateOnlineUsers = (users) => {
    onlineUsers.value = users
  }

  // 设置连接状态
  const setConnected = (status) => {
    isConnected.value = status
  }

  // 在线用户数量
  const onlineUserCount = computed(() => onlineUsers.value.length)

  // 获取同步管理器实例
  const getSyncManager = () => syncManager

  return {
    // 状态
    currentUser,
    onlineUsers,
    isConnected,
    onlineUserCount,
    
    // 方法
    setCurrentUser,
    addOnlineUser,
    removeOnlineUser,
    updateOnlineUsers,
    setConnected,
    ensureUserName,
    initSync,
    destroySync,
    getSyncManager
  }
})
