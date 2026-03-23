<template>
  <div class="table-view">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="logo" @click="goHome">协同表格</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/table" class="nav-link active">表格</router-link>
          <router-link to="/about" class="nav-link">关于</router-link>
        </div>
      </div>
    </nav>

    <div class="content">
      <CollaborativeTable />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CollaborativeTable from '@/components/CollaborativeTable.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.table-view {
  min-height: 100vh;
  background: #fafafa;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #1a1a1a;
}

.content {
  padding: 30px 20px;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 20px;
  }
}
</style>
