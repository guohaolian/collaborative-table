<template>
  <div class="toolbar">
    <button @click="$emit('add-row')" class="btn">添加行</button>
    <button @click="$emit('add-column')" class="btn">添加列</button>
    <button @click="$emit('export')" class="btn btn-secondary">导出</button>
    <button @click="$emit('simulate')" class="btn btn-secondary">模拟编辑</button>
    <div class="status" :class="{ connected: isConnected }">
      <span class="dot"></span>
      {{ isConnected ? '已连接' : '连接中' }}
    </div>
  </div>
</template>

<script setup>
defineProps({ isConnected: Boolean })
defineEmits(['add-row', 'add-column', 'export', 'simulate'])
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: #1a1a1a;
  color: white;
}

.btn:hover {
  background: #333;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  background: #fafafa;
}

.status {
  margin-left: auto;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status.connected {
  background: #f0fdf4;
  color: #16a34a;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    width: 100%;
  }

  .toolbar .btn {
    width: 100%;
  }

  .status {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>
