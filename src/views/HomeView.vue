<template>
  <div class="home-view">
    <div class="container">
      <header class="hero">
        <h1 class="title">协同表格系统</h1>
        <p class="subtitle">多人实时在线编辑</p>
      </header>

      <div class="features">
        <div class="feature">
          <div class="icon">⚡</div>
          <h3>实时协同</h3>
          <p>多人同时编辑，数据实时同步</p>
        </div>
        <div class="feature">
          <div class="icon">🔄</div>
          <h3>冲突解决</h3>
          <p>智能算法保证数据一致性</p>
        </div>
        <div class="feature">
          <div class="icon">👥</div>
          <h3>在线状态</h3>
          <p>实时显示用户编辑位置</p>
        </div>
      </div>

      <div class="actions">
        <button @click="goToTable" class="btn-start">开始使用</button>
        <button @click="goToAbout" class="btn-learn">了解更多</button>
      </div>

      <div class="tech-stack">
        <span class="tech-tag">Vue 3</span>
        <span class="tech-tag">Vite</span>
        <span class="tech-tag">Pinia</span>
        <span class="tech-tag">Vue Router</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToTable = () => {
  router.push('/table')
}

const goToAbout = () => {
  router.push('/about')
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #fafafa;
}

.container {
  max-width: 900px;
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 56px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 20px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
}

.feature {
  text-align: center;
  padding: 32px 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  transition: all 0.2s;
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d5d5d5;
}

.icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.feature h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.feature p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 60px;
}

.btn-start,
.btn-learn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start {
  background: #1a1a1a;
  color: white;
}

.btn-start:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-learn {
  background: white;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

.btn-learn:hover {
  border-color: #1a1a1a;
  transform: translateY(-1px);
}

.tech-stack {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tag {
  padding: 6px 16px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

@media (max-width: 768px) {
  .title {
    font-size: 40px;
  }

  .subtitle {
    font-size: 18px;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-start,
  .btn-learn {
    width: 100%;
  }
}
</style>
