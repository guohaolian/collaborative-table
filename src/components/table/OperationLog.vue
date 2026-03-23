<template>
  <div class="operation-log">
    <h3>操作记录</h3>
    <div class="log-list">
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        <span class="log-time">{{ formatTime(log.timestamp) }}</span>
        <span class="log-user" :style="{ color: log.userColor }">{{ log.userName }}</span>
        <span class="log-action">{{ log.action }}</span>
      </div>
      <div v-if="logs.length === 0" class="empty-logs">
        暂无操作记录
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  logs: Array
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.operation-log {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.operation-log h3 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.log-item {
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  gap: 12px;
  align-items: center;
  animation: fadeIn 0.3s;
  border-left: 2px solid #e5e5e5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.log-time {
  color: #999;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
}

.log-user {
  font-weight: 600;
  min-width: 60px;
}

.log-action {
  color: #666;
}

.empty-logs {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
</style>
