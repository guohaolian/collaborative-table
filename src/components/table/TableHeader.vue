<template>
  <div class="header">
    <h2>协同编辑</h2>
    <div class="online-users">
      <span class="user-count">{{ onlineCount }} 人在线</span>
      <div class="user-avatars">
        <div 
          v-for="user in onlineUsers" 
          :key="user.id"
          class="user-avatar"
          :style="{ backgroundColor: user.color }"
          :title="user.name"
        >
          {{ user.name.charAt(0) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  onlineUsers: Array,
  onlineCount: Number
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.header h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 600;
}

.online-users {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-count {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.user-avatars {
  display: flex;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
