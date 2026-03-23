import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import SyncManager from '@/utils/syncManager'

export const useUserStore = defineStore('user', () => {
  // 同步管理器
  let syncManager = null
  
  // 当前标签页的用户信息
  const currentUser = ref({
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '用户' + Math.floor(Math.random() * 100),
    color: generateColor(),
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

  // 初始化同步管理器
  const initSync = () => {
    if (!syncManager) {
      syncManager = new SyncManager('collaborative-table-sync')
      currentUser.value.instanceId = syncManager.instanceId
      
      // 监听其他标签页用户上线
      syncManager.on('user_online', (data) => {
        console.log('[UserStore] 其他标签页上线:', data.user)
        if (data.user && !onlineUsers.value.find(u => u.instanceId === data.user.instanceId)) {
          onlineUsers.value.push(data.user)
        }
        
        // 响应同步请求，告诉新标签页我的信息（只发送可序列化的数据）
        syncManager.broadcast({
          type: 'user_info',
          user: {
            id: currentUser.value.id,
            name: currentUser.value.name,
            color: currentUser.value.color,
            instanceId: currentUser.value.instanceId
          }
        })
      })

      // 监听其他标签页用户信息
      syncManager.on('user_info', (data) => {
        if (data.user && !onlineUsers.value.find(u => u.instanceId === data.user.instanceId)) {
          onlineUsers.value.push(data.user)
        }
      })

      // 监听其他标签页用户下线
      syncManager.on('user_offline', (data) => {
        console.log('[UserStore] 其他标签页下线:', data.instanceId)
        const index = onlineUsers.value.findIndex(u => u.instanceId === data.instanceId)
        if (index > -1) {
          onlineUsers.value.splice(index, 1)
        }
      })

      // 添加当前用户到在线列表
      onlineUsers.value.push(currentUser.value)
      
      // 广播自己上线（只发送可序列化的数据）
      syncManager.broadcast({
        type: 'user_online',
        user: {
          id: currentUser.value.id,
          name: currentUser.value.name,
          color: currentUser.value.color,
          instanceId: currentUser.value.instanceId
        }
      })

      isConnected.value = true
    }
  }

  // 销毁同步管理器
  const destroySync = () => {
    if (syncManager) {
      syncManager.destroy()
      syncManager = null
    }
  }

  // 设置当前用户信息
  const setCurrentUser = (userInfo) => {
    currentUser.value = { ...currentUser.value, ...userInfo }
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
    initSync,
    destroySync,
    getSyncManager
  }
})
