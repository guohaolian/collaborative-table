<template>
  <div class="collaborative-table-container">
    <TableHeader 
      :online-users="userStore.onlineUsers"
      :online-count="userStore.onlineUserCount"
    />
    
    <TableToolbar 
      @add-row="handleAddRow"
      @add-column="handleAddColumn"
      @export="handleExport"
      @simulate="simulateRemoteEdit"
      :is-connected="userStore.isConnected"
    />
    
    <TableGrid 
      :columns="tableStore.columns"
      :table-data="tableStore.tableData"
      :get-cell-value="tableStore.getCellValue"
      :get-editing-user="getEditingUser"
      :get-cell-class="getCellClass"
      @cell-input="handleCellInput"
      @cell-focus="handleCellFocus"
      @cell-blur="handleCellBlur"
      @column-update="handleColumnNameUpdate"
    />
    
    <TableStats :statistics="tableStore.statistics" :data-stats="dataStats" />
    
    <OperationLog :logs="tableStore.recentLogs" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTableStore } from '@/stores/tableStore'
import TableHeader from './table/TableHeader.vue'
import TableToolbar from './table/TableToolbar.vue'
import TableGrid from './table/TableGrid.vue'
import TableStats from './table/TableStats.vue'
import OperationLog from './table/OperationLog.vue'

const userStore = useUserStore()
const tableStore = useTableStore()

const dataStats = computed(() => ({
  rows: tableStore.tableData.length,
  columns: tableStore.columns.length
}))

const handleCellInput = (rowIndex, colIndex, value) => {
  tableStore.setCellValue(rowIndex, colIndex, value, true) // 第三个参数 true 表示广播
  tableStore.addLog(`修改了单元格 [${rowIndex + 1}, ${colIndex + 1}]`, userStore.currentUser.name, userStore.currentUser.color)
}

const handleCellFocus = (rowIndex, colIndex) => {
  const cellKey = `${rowIndex}_${colIndex}`
  tableStore.setEditingCell(cellKey, {
    userId: userStore.currentUser.id,
    userName: userStore.currentUser.name,
    userColor: userStore.currentUser.color,
    instanceId: userStore.currentUser.instanceId
  }, true) // 第二个参数 true 表示广播
}

const handleCellBlur = (rowIndex, colIndex) => {
  const cellKey = `${rowIndex}_${colIndex}`
  setTimeout(() => {
    const editor = tableStore.getEditingUser(rowIndex, colIndex)
    if (editor && editor.instanceId === userStore.currentUser.instanceId) {
      tableStore.setEditingCell(cellKey, null, true) // 广播失焦状态
    }
  }, 100)
}

const getEditingUser = (rowIndex, colIndex) => {
  const editor = tableStore.getEditingUser(rowIndex, colIndex)
  // 不显示自己的编辑状态
  return editor && editor.instanceId !== userStore.currentUser.instanceId ? editor : null
}

const getCellClass = (rowIndex, colIndex) => {
  const editor = tableStore.getEditingUser(rowIndex, colIndex)
  return {
    'being-edited': editor && editor.instanceId !== userStore.currentUser.instanceId,
    'editing-self': editor && editor.instanceId === userStore.currentUser.instanceId
  }
}

const handleColumnNameUpdate = (colIndex) => {
  const name = tableStore.columns[colIndex].name
  tableStore.updateColumnName(colIndex, name, true) // 广播列名更新
  tableStore.addLog(`修改了列名: ${name}`, userStore.currentUser.name, userStore.currentUser.color)
}

const handleAddRow = () => {
  tableStore.addRow(true) // 广播添加行
  tableStore.addLog('添加了新行', userStore.currentUser.name, userStore.currentUser.color)
}

const handleAddColumn = () => {
  tableStore.addColumn(true) // 广播添加列
  tableStore.addLog('添加了新列', userStore.currentUser.name, userStore.currentUser.color)
}

const handleExport = () => {
  const data = tableStore.exportData()
  console.log('导出数据:', data)
  console.table(data)
  alert('数据已导出到控制台（按 F12 查看）')
  tableStore.addLog('导出了数据', userStore.currentUser.name, userStore.currentUser.color)
}

const simulateRemoteEdit = () => {
  const mockUsers = [
    { name: '张三', color: '#10b981' },
    { name: '李四', color: '#3b82f6' },
    { name: '王五', color: '#8b5cf6' }
  ]
  
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
  const randomRow = Math.floor(Math.random() * tableStore.tableData.length)
  const randomCol = Math.floor(Math.random() * tableStore.columns.length)
  const cellKey = `${randomRow}_${randomCol}`
  
  tableStore.setEditingCell(cellKey, {
    userId: 'remote_' + Math.random(),
    userName: randomUser.name,
    userColor: randomUser.color,
    instanceId: 'simulation'
  }, false) // 模拟不广播
  
  tableStore.addLog(`开始编辑单元格 [${randomRow + 1}, ${randomCol + 1}]`, randomUser.name, randomUser.color)
  
  setTimeout(() => {
    tableStore.setCellValue(randomRow, randomCol, '模拟编辑 - ' + Date.now().toString().slice(-4), false)
    tableStore.setEditingCell(cellKey, null, false)
    tableStore.addLog(`完成编辑单元格 [${randomRow + 1}, ${randomCol + 1}]`, randomUser.name, randomUser.color)
  }, 2000)
}

const initCollaboration = () => {
  console.log('[CollaborativeTable] 初始化协同功能')
  
  // 初始化用户同步
  userStore.initSync()
  
  // 初始化表格同步（传入同步管理器）
  const syncManager = userStore.getSyncManager()
  if (syncManager) {
    tableStore.initSync(syncManager)
  }
  
  tableStore.addLog('加入了协作', userStore.currentUser.name, userStore.currentUser.color)
}

// 组件挂载
onMounted(() => {
  initCollaboration()
})

// 组件卸载
onUnmounted(() => {
  console.log('[CollaborativeTable] 销毁协同功能')
  userStore.destroySync()
})
</script>

<style scoped>
.collaborative-table-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 28px;
  border: 1px solid #e5e5e5;
}

@media (max-width: 768px) {
  .collaborative-table-container {
    padding: 20px;
  }
}
</style>
