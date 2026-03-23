<template>
  <div class="stats">
    <div class="stat-item">
      <div class="stat-value">{{ statistics.totalOperations }}</div>
      <div class="stat-label">操作次数</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ dataStats.rows }}</div>
      <div class="stat-label">数据行</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ dataStats.columns }}</div>
      <div class="stat-label">数据列</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ statistics.avgSyncTime }}ms</div>
      <div class="stat-label">同步延迟</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  statistics: Object,
  dataStats: Object
})
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}
</style>
