import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTableStore = defineStore('table', () => {
  // 表格列配置
  const columns = ref([
    { id: 'col_1', name: '姓名', width: 180 },
    { id: 'col_2', name: '部门', width: 180 },
    { id: 'col_3', name: '职位', width: 180 },
    { id: 'col_4', name: '邮箱', width: 220 }
  ])

  // 表格数据
  const tableData = ref([
    { id: 'row_1', cells: {} },
    { id: 'row_2', cells: {} },
    { id: 'row_3', cells: {} }
  ])

  // 编辑状态（记录哪个单元格正在被谁编辑）
  const editingCells = ref({})

  // 操作日志
  const operationLogs = ref([])

  // 操作队列
  const operationQueue = ref([])

  // 版本号
  const version = ref(0)

  // 统计数据
  const statistics = ref({
    totalOperations: 0,
    avgSyncTime: 85,
    lastSyncTime: 0
  })

  // 同步管理器引用（由 userStore 提供）
  let syncManager = null

  // 初始化跨标签页同步
  const initSync = (sync) => {
    syncManager = sync
    
    if (syncManager) {
      console.log('[TableStore] 初始化跨标签页同步')
      
      // 监听单元格更新
      syncManager.on('cell_update', handleRemoteCellUpdate)
      
      // 监听列更新
      syncManager.on('column_update', handleRemoteColumnUpdate)
      
      // 监听添加行
      syncManager.on('row_add', handleRemoteRowAdd)
      
      // 监听添加列
      syncManager.on('column_add', handleRemoteColumnAdd)
      
      // 监听编辑状态
      syncManager.on('editing_state', handleRemoteEditingState)
      
      // 监听同步请求
      syncManager.on('sync_request', handleSyncRequest)
      
      // 监听同步响应
      syncManager.on('sync_response', handleSyncResponse)

      // 请求同步数据（新标签页打开时）
      setTimeout(() => {
        syncManager.requestSync()
      }, 500)
    }
  }

  // 处理远程单元格更新
  const handleRemoteCellUpdate = (data) => {
    console.log('[TableStore] 收到远程单元格更新:', data)
    const { rowIndex, colIndex, value } = data
    
    if (rowIndex >= 0 && colIndex >= 0 && tableData.value[rowIndex]) {
      const colId = columns.value[colIndex].id
      if (!tableData.value[rowIndex].cells) {
        tableData.value[rowIndex].cells = {}
      }
      tableData.value[rowIndex].cells[colId] = value
      version.value++
    }
  }

  // 处理远程列更新
  const handleRemoteColumnUpdate = (data) => {
    console.log('[TableStore] 收到远程列更新:', data)
    const { colIndex, name } = data
    
    if (colIndex >= 0 && columns.value[colIndex]) {
      columns.value[colIndex].name = name
      version.value++
    }
  }

  // 处理远程添加行
  const handleRemoteRowAdd = (data) => {
    console.log('[TableStore] 收到远程添加行:', data)
    const { row } = data
    
    if (row && !tableData.value.find(r => r.id === row.id)) {
      tableData.value.push(row)
      version.value++
    }
  }

  // 处理远程添加列
  const handleRemoteColumnAdd = (data) => {
    console.log('[TableStore] 收到远程添加列:', data)
    const { column } = data
    
    if (column && !columns.value.find(c => c.id === column.id)) {
      columns.value.push(column)
      version.value++
    }
  }

  // 处理远程编辑状态
  const handleRemoteEditingState = (data) => {
    const { cellKey, userInfo, isEditing } = data
    
    if (isEditing && userInfo) {
      editingCells.value[cellKey] = userInfo
    } else {
      delete editingCells.value[cellKey]
    }
  }

  // 处理同步请求
  const handleSyncRequest = (data) => {
    console.log('[TableStore] 收到同步请求，发送当前数据')
    if (syncManager) {
      // 只发送可序列化的数据
      syncManager.respondSync({
        columns: JSON.parse(JSON.stringify(columns.value)),
        tableData: JSON.parse(JSON.stringify(tableData.value)),
        version: version.value
      })
    }
  }

  // 处理同步响应
  const handleSyncResponse = (data) => {
    console.log('[TableStore] 收到同步响应:', data)
    if (data.data && data.data.columns && data.data.tableData) {
      // 只在版本号更新时同步
      if (data.data.version > version.value) {
        columns.value = data.data.columns
        tableData.value = data.data.tableData
        version.value = data.data.version
        console.log('[TableStore] 同步完成')
      }
    }
  }

  // 获取单元格值
  const getCellValue = (rowIndex, colIndex) => {
    const row = tableData.value[rowIndex]
    const colId = columns.value[colIndex]?.id
    return row?.cells?.[colId] || ''
  }

  // 设置单元格值（带同步）
  const setCellValue = (rowIndex, colIndex, value, broadcast = true) => {
    const row = tableData.value[rowIndex]
    const colId = columns.value[colIndex]?.id
    if (row && colId) {
      if (!row.cells) {
        row.cells = {}
      }
      row.cells[colId] = value
      version.value++
      statistics.value.totalOperations++
      
      // 广播到其他标签页
      if (broadcast && syncManager) {
        syncManager.broadcast({
          type: 'cell_update',
          rowIndex,
          colIndex,
          value
        })
      }
    }
  }

  // 添加行（带同步）
  const addRow = (broadcast = true) => {
    const newRow = {
      id: 'row_' + Date.now(),
      cells: {}
    }
    tableData.value.push(newRow)
    version.value++
    statistics.value.totalOperations++
    
    // 广播到其他标签页
    if (broadcast && syncManager) {
      syncManager.broadcast({
        type: 'row_add',
        row: newRow
      })
    }
    
    return newRow
  }

  // 添加列（带同步）
  const addColumn = (broadcast = true) => {
    const newCol = {
      id: 'col_' + Date.now(),
      name: '新列',
      width: 180
    }
    columns.value.push(newCol)
    version.value++
    statistics.value.totalOperations++
    
    // 广播到其他标签页
    if (broadcast && syncManager) {
      syncManager.broadcast({
        type: 'column_add',
        column: newCol
      })
    }
    
    return newCol
  }

  // 更新列名（带同步）
  const updateColumnName = (colIndex, name, broadcast = true) => {
    if (columns.value[colIndex]) {
      columns.value[colIndex].name = name
      version.value++
      
      // 广播到其他标签页
      if (broadcast && syncManager) {
        syncManager.broadcast({
          type: 'column_update',
          colIndex,
          name
        })
      }
    }
  }

  // 设置单元格编辑状态（带同步）
  const setEditingCell = (cellKey, userInfo, broadcast = true) => {
    if (userInfo) {
      editingCells.value[cellKey] = userInfo
    } else {
      delete editingCells.value[cellKey]
    }
    
    // 广播到其他标签页
    if (broadcast && syncManager) {
      syncManager.broadcast({
        type: 'editing_state',
        cellKey,
        userInfo,
        isEditing: !!userInfo
      })
    }
  }

  // 获取单元格编辑者
  const getEditingUser = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}_${colIndex}`
    return editingCells.value[cellKey] || null
  }

  // 添加操作日志
  const addLog = (action, userName, userColor) => {
    operationLogs.value.push({
      action,
      userName,
      userColor,
      timestamp: Date.now()
    })
    // 限制日志数量
    if (operationLogs.value.length > 1000) {
      operationLogs.value.shift()
    }
  }

  // 添加操作到队列
  const addOperation = (operation) => {
    operationQueue.value.push(operation)
  }

  // 清空操作队列
  const clearOperationQueue = () => {
    operationQueue.value = []
  }

  // 导出数据
  const exportData = () => {
    return tableData.value.map((row, index) => {
      const rowData = { '行号': index + 1 }
      columns.value.forEach(col => {
        rowData[col.name] = row.cells[col.id] || ''
      })
      return rowData
    })
  }

  // 计算属性 - 最近的操作日志
  const recentLogs = computed(() => {
    return operationLogs.value.slice(-10).reverse()
  })

  // 计算属性 - 总单元格数
  const totalCells = computed(() => {
    return tableData.value.length * columns.value.length
  })

  return {
    // 状态
    columns,
    tableData,
    editingCells,
    operationLogs,
    operationQueue,
    version,
    statistics,
    
    // 方法
    getCellValue,
    setCellValue,
    addRow,
    addColumn,
    updateColumnName,
    setEditingCell,
    getEditingUser,
    addLog,
    addOperation,
    clearOperationQueue,
    exportData,
    initSync,
    
    // 计算属性
    recentLogs,
    totalCells
  }
})
