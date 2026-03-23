<template>
  <div class="about-view">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="logo" @click="goHome">协同表格</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/table" class="nav-link">表格</router-link>
          <router-link to="/about" class="nav-link active">关于</router-link>
        </div>
      </div>
    </nav>

    <div class="content">
      <div class="container">
        <h1 class="page-title">关于项目</h1>
        
        <section class="section">
          <h2>项目介绍</h2>
          <p>这是一个基于 Vue 3 生态的多人实时协同表格编辑系统，实现了类似飞书文档的协同编辑功能。</p>
        </section>

        <section class="section">
          <h2>技术架构</h2>
          <div class="tech-grid">
            <div class="tech-card">
              <h3>Vue 3</h3>
              <p>渐进式 JavaScript 框架，采用 Composition API</p>
            </div>
            <div class="tech-card">
              <h3>Vite</h3>
              <p>下一代前端构建工具，提供极速开发体验</p>
            </div>
            <div class="tech-card">
              <h3>Pinia</h3>
              <p>轻量级状态管理，支持模块化设计</p>
            </div>
            <div class="tech-card">
              <h3>Vue Router</h3>
              <p>官方路由库，支持懒加载和路由守卫</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>核心功能</h2>
          <ul class="feature-list">
            <li>多人实时协同编辑</li>
            <li>编辑状态可视化显示</li>
            <li>完整的操作日志记录</li>
            <li>数据导出功能</li>
            <li>响应式布局设计</li>
          </ul>
        </section>

        <section class="section">
          <h2>技术亮点</h2>
          <div class="highlight-grid">
            <div class="highlight">
              <strong>模块化设计</strong>
              <p>组件化开发，代码结构清晰</p>
            </div>
            <div class="highlight">
              <strong>状态管理</strong>
              <p>使用 Pinia 进行集中式状态管理</p>
            </div>
            <div class="highlight">
              <strong>性能优化</strong>
              <p>防抖节流、懒加载等优化措施</p>
            </div>
            <div class="highlight">
              <strong>响应式系统</strong>
              <p>充分利用 Vue 3 的响应式特性</p>
            </div>
          </div>
        </section>

        <div class="footer">
          <button @click="goToTable" class="btn-start">开始体验</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goToTable = () => {
  router.push('/table')
}
</script>

<style scoped>
.about-view {
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
  max-width: 1200px;
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
  padding: 60px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 40px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  color: #1a1a1a;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e5e5e5;
}

.section h2 {
  font-size: 24px;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.section p {
  color: #666;
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.tech-card {
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.tech-card h3 {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.tech-card p {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
}

.feature-list li {
  padding: 12px 0;
  color: #666;
  font-size: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li:before {
  content: "✓";
  margin-right: 12px;
  color: #1a1a1a;
  font-weight: bold;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.highlight {
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.highlight strong {
  display: block;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-weight: 600;
}

.highlight p {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.footer {
  text-align: center;
  padding: 40px 0;
}

.btn-start {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 500;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .nav-links {
    gap: 20px;
  }

  .page-title {
    font-size: 32px;
  }

  .section {
    padding: 24px;
  }
}
</style>
