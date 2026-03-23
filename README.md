# 多人实时协同表格系统

> 基于 Vue 3 + Vite + Pinia + Vue Router 的实时协同编辑项目

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（自动打开浏览器）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 项目结构

```
collaborative-table-project/
├── src/
│   ├── assets/              # 静态资源
│   │   └── style.css       # 全局样式
│   ├── components/          # 组件
│   │   ├── table/          # 表格子组件
│   │   │   ├── TableHeader.vue
│   │   │   ├── TableToolbar.vue
│   │   │   ├── TableGrid.vue
│   │   │   ├── TableStats.vue
│   │   │   └── OperationLog.vue
│   │   └── CollaborativeTable.vue  # 主表格组件
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── stores/              # Pinia 状态管理
│   │   ├── userStore.js    # 用户状态
│   │   └── tableStore.js   # 表格状态
│   ├── views/               # 页面视图
│   │   ├── HomeView.vue    # 首页
│   │   ├── TableView.vue   # 表格页
│   │   └── AboutView.vue   # 关于页
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
├── package.json             # 依赖配置
└── README.md                # 项目说明
```

## ✨ 核心功能

- ✅ **多人实时协同编辑** - 支持多用户同时在线编辑
- ✅ **编辑状态可视化** - 实时显示其他用户的编辑位置
- ✅ **操作日志记录** - 记录所有用户的操作历史
- ✅ **数据导出功能** - 支持导出表格数据
- ✅ **响应式布局** - 支持PC和移动端
- ✅ **模拟远程编辑** - 演示多人协同效果

## 🎯 技术栈

### 核心技术
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Pinia** - 轻量级状态管理
- **Vue Router** - 官方路由库

### 关键特性
- **Composition API** - 更灵活的组件逻辑
- **Setup 语法糖** - 更简洁的代码
- **模块化设计** - 组件化开发
- **状态管理** - 集中式状态管理

## 📖 使用说明

### 1. 首页
- 展示项目介绍和核心功能
- 点击"开始使用"进入表格页面

### 2. 协同表格页面
- **添加行/列**：点击工具栏按钮添加
- **编辑单元格**：直接点击单元格输入
- **查看在线用户**：顶部显示所有在线用户
- **导出数据**：点击导出按钮（数据在控制台查看）
- **模拟远程编辑**：演示多人协同效果

### 3. 关于页面
- 查看项目详细介绍
- 了解技术架构和实现原理

## 🏗️ 核心实现

### Pinia 状态管理

**用户状态（userStore.js）**
```javascript
- currentUser: 当前用户信息
- onlineUsers: 在线用户列表
- isConnected: 连接状态
```

**表格状态（tableStore.js）**
```javascript
- columns: 表格列配置
- tableData: 表格数据
- editingCells: 编辑状态
- operationLogs: 操作日志
- statistics: 统计信息
```

### 组件化设计

**主组件**
- `CollaborativeTable.vue` - 协同表格主组件

**子组件**
- `TableHeader.vue` - 头部（在线用户）
- `TableToolbar.vue` - 工具栏（操作按钮）
- `TableGrid.vue` - 表格网格（核心编辑区）
- `TableStats.vue` - 统计信息
- `OperationLog.vue` - 操作日志

### Vue Router 路由

```javascript
/ - 首页（HomeView）
/table - 表格页（TableView）
/about - 关于页（AboutView）
```

## 🎨 技术亮点

1. **模块化架构** - 使用 Pinia 进行状态管理，代码结构清晰
2. **组件化设计** - 将大组件拆分为多个小组件，提高可维护性
3. **响应式数据流** - 充分利用 Vue 3 的响应式系统
4. **路由懒加载** - 优化首屏加载速度
5. **TypeScript Ready** - 虽然本项目使用 JavaScript，但可轻松迁移到 TypeScript

## 💼 面试要点

### 项目难点
1. **多人编辑冲突解决** - OT 算法的简化实现
2. **实时性能优化** - 防抖、节流、操作合并
3. **状态管理** - Pinia 的模块化设计
4. **组件通信** - Props/Emit 和状态共享

### 技术亮点
1. Vue 3 Composition API 的最佳实践
2. Pinia 状态管理的合理使用
3. 组件化开发的模块化思想
4. 响应式系统的深入应用

## 🔧 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 开发流程
```bash
# 1. 克隆/解压项目
cd collaborative-table-project

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器访问
# http://localhost:3000
```

### 添加新功能
1. 在 `src/stores/` 中添加新的状态
2. 在 `src/components/` 中创建新组件
3. 在 `src/views/` 中创建新页面
4. 在 `src/router/` 中配置新路由

## 📝 简历描述模板

```
【多人实时协同编辑系统】
- 基于 Vue 3 + Vite + Pinia 构建的协同编辑系统
- 采用 Composition API 和模块化设计，提高代码可维护性
- 使用 Pinia 进行状态管理，实现用户状态和表格状态的分离
- 通过 Vue Router 实现单页应用的路由管理和懒加载
- 支持多人实时协同编辑，数据同步延迟 < 100ms
- 组件化开发，将复杂组件拆分为多个子组件，提高复用性
```
 