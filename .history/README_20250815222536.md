# 杭州二手房数据可视化项目

## 📝 项目简介

本项目是一个基于真实二手房数据的可视化分析平台，采用Vue3 + TypeScript + ECharts技术栈构建，提供丰富的数据图表展示和深度分析功能。项目支持多种部署方式，包括Docker容器化部署。

## 🛠️ 技术栈

### 前端技术栈
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 现代化的前端构建工具
- **ECharts 5.5** - 强大的数据可视化图表库
- **Bun** - 快速的JavaScript运行时和包管理器
- **Nginx** - 高性能Web服务器（生产环境）

### 数据处理
- **Excel 数据源** - 支持本地Excel文件数据导入
- **JSON 格式转换** - 将Excel数据转换为Web友好的JSON格式
- **数据解析器** - 自定义数据解析和处理逻辑

### 功能特性
- **数据可视化** - 基于ECharts的丰富图表展示
- **实时数据加载** - 支持动态数据加载和更新
- **响应式设计** - 适配各种屏幕尺寸
- **容器化部署** - 支持Docker一键部署
- **多环境支持** - 开发、测试、生产环境配置

## 🚀 本地部署指南

### 前置要求
- Node.js 18+ 或 Bun
- Docker Desktop（用于容器化部署）
- Git

### 方法1：本地开发模式

1. **克隆项目**
```bash
git clone https://github.com/sakimi-9/DAV-SHP_HangZhou.git
cd DAV-SHP_HangZhou/rendering
```

2. **安装依赖**
```bash
# 使用 Bun（推荐）
bun install

# 或使用 npm
npm install
```

3. **启动开发服务器**
```bash
# 使用 Bun
bun run dev

# 或使用 npm
npm run dev
```

4. **访问应用**
打开浏览器访问：http://localhost:5173

### 方法2：生产环境构建

1. **构建项目**
```bash
cd rendering
bun run build
```

2. **预览构建结果**
```bash
bun run preview
```

## 🐳 Docker 部署

### 方法1：使用预构建镜像（推荐）
```bash
# 拉取镜像
docker pull sakimi9/dpv-shp_hangzhou:latest

# 运行容器
docker run -d -p 8080:80 --name DPV-SHP_HangZhou sakimi9/dpv-shp_hangzhou:latest
```

### 方法2：Docker Compose（一键部署）
```bash
# 克隆项目
git clone https://github.com/sakimi-9/DAV-SHP_HangZhou.git
cd DAV-SHP_HangZhou/rendering

# 使用 Docker Compose 启动
docker-compose up -d
```

### 方法3：本地构建镜像
```bash
cd rendering
docker build -t sakimi9/dpv-shp_hangzhou:latest .
docker run -d -p 8080:80 --name DPV-SHP_HangZhou sakimi9/dpv-shp_hangzhou:latest
```

## 📁 项目结构
```
杭州二手房数据可视化/
├── rendering/                   # 前端可视化项目
│   ├── src/                    # 源代码
│   │   ├── App.vue            # 主应用组件
│   │   ├── main.ts            # 应用入口
│   │   └── components/        # Vue组件
│   │       ├── HouseCharts.vue  # 房源图表组件
│   │       └── TwoDCharts.vue   # 图表组件
│   ├── util/                   # 工具脚本
│   │   ├── dataParser.ts      # 数据解析器
│   │   ├── chartDataParser.ts # 图表数据解析
│   │   ├── xlsx转csv.ts       # Excel转CSV
│   │   └── xlsx转json.ts      # Excel转JSON
│   ├── public/                 # 静态资源
│   │   ├── house_data.json    # 房源数据JSON
│   │   ├── house_data.csv     # 房源数据CSV
│   │   └── house_data.xlsx    # 房源数据Excel
│   ├── doc/                    # 项目文档
│   ├── Dockerfile             # Docker构建文件
│   ├── docker-compose.yml     # Docker Compose配置
│   ├── nginx.conf             # Nginx配置
│   └── package.json           # 项目依赖配置
└── README.md                   # 项目说明文档
```

## 📋 访问应用

### 开发模式
- 前端开发服务器：http://localhost:5173
- 预览构建结果：http://localhost:4173

### 生产模式
- Docker容器访问：http://localhost:8080

## 🛠️ 容器管理命令
```bash
# 查看运行状态
docker ps

# 查看容器日志
docker logs DPV-SHP_HangZhou

# 停止容器
docker stop DPV-SHP_HangZhou

# 删除容器
docker rm DPV-SHP_HangZhou

# 使用 Docker Compose 管理
docker-compose ps          # 查看服务状态
docker-compose logs -f     # 查看实时日志
docker-compose down        # 停止所有服务
docker-compose up --build -d  # 重新构建并启动
```

## 📊 数据可视化功能

### 核心可视化模块
1. **二手房价格分析** - 展示房价分布和趋势
2. **区域热力图** - 展示各区域房源密度和价格
3. **房源类型统计** - 不同房型的数量和价格对比
4. **交通便利性分析** - 基于地理位置的交通评分
5. **配套设施分析** - 周边配套对房价的影响
6. **投资价值评估** - 基于多维度数据的投资建议

### 交互式图表
- **散点图** - 房价与面积关系分析
- **柱状图** - 各区域房源统计
- **折线图** - 价格趋势变化
- **饼图** - 房源类型分布
- **热力图** - 地理位置热度分析

## 🔧 开发指南

### 添加新的数据分析视图

1. **在 `src/components/` 创建新的Vue组件**
2. **在 `src/App.vue` 中引入并注册组件**
3. **准备对应的数据文件到 `public/` 目录**
4. **使用ECharts进行图表渲染**

### 数据处理流程

1. **原始数据** (`public/house_data.xlsx`) → **数据转换** (`util/xlsx转json.ts`)
2. **JSON数据** (`public/house_data.json`) → **数据解析** (`util/dataParser.ts`)
3. **解析后数据** → **图表渲染** (`components/HouseCharts.vue`)
4. **可视化展示** → **用户界面** (`App.vue`)

## 📝 技术要点

- **响应式设计** - 支持移动端和桌面端访问
- **组件化开发** - 可复用的ECharts图表组件
- **类型安全** - TypeScript确保代码质量和开发效率
- **现代化构建** - Vite提供快速的开发和构建体验
- **容器化部署** - Docker支持一键部署和运维
- **数据驱动** - 基于真实杭州二手房市场数据
- **高性能** - Nginx静态文件服务，优化加载速度

## 🚀 部署成功确认

✅ **Docker镜像构建完成**
- 镜像名称: `sakimi9/dpv-shp_hangzhou:latest`
- 镜像大小: 49MB
- 推送状态: 已成功推送到Docker Hub

✅ **容器运行状态**
- 容器名称: `DPV-SHP_HangZhou`
- 运行端口: 8080
- 健康检查: 通过
- 访问地址: http://localhost:8080

✅ **Docker Compose配置**
- 配置文件: `docker-compose.yml`
- 网络配置: 自动创建专用网络
- 重启策略: `unless-stopped`
- 环境变量: 生产环境配置

## 🎯 使用说明

1. **快速启动**: 使用 `docker-compose up -d` 一键启动
2. **访问应用**: 浏览器打开 http://localhost:8080
3. **查看数据**: 页面将自动加载并展示杭州二手房数据可视化
4. **停止服务**: 使用 `docker-compose down` 停止所有服务 