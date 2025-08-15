# 北京二手房数据可视化项目

## 📝 项目简介

基于北京二手房真实数据的可视化分析平台，采用Vue3 + TypeScript + ECharts技术栈。

## 🛠️ 技术栈

- **Vue 3** + **TypeScript** - 前端框架
- **ECharts 5.5** - 数据可视化
- **Vite** - 构建工具  
- **Bun** - 包管理器
- **Nginx** - 生产环境服务器
- **Docker** - 容器化部署

## 🚀 快速开始

### 本地开发
```bash
git clone https://github.com/sakimi-9/DPV-SHP_BeiJing.git
cd DPV-SHP_BeiJing/py_crawler/rendering
bun install
bun run dev
```
访问：http://localhost:5173

## 🐳 Docker 部署（前端可视化部分）

### 方法1：使用预构建镜像（推荐）
```bash
# 拉取镜像
docker pull sakimi9/dpv-shp_beijing:latest

# 运行容器
docker run -d -p 8080:80 --name dpv-shp_beijing sakimi9/dpv-shp_beijing:latest
```

### 方法2：Docker Compose（一键部署）
```bash
# 克隆项目
git clone https://github.com/sakimi-9/DPV-SHP_BeiJing.git
cd DPV-SHP_BeiJing/py_crawler/rendering

# 使用 Docker Compose 启动
docker-compose up -d
```

### 方法3：本地构建镜像
```bash
cd py_crawler/rendering
docker build -t sakimi9/dpv-shp_beijing:latest .
docker run -d -p 8080:80 --name dpv-shp_beijing sakimi9/dpv-shp_beijing:latest
```

访问：http://localhost:8080

## 📁 项目结构
```
DPV-SHP_BeiJing/                    # 北京二手房数据可视化项目
├── py_crawler/                     # 爬虫与数据处理模块
│   ├── data_handle/               # 数据处理脚本
│   │   ├── data_deduplication.py  # 数据去重
│   │   ├── data_division.py       # 数据分割
│   │   ├── files_deduplication.py # 文件去重
│   │   └── selected_files_deduplication.py # 选择性文件去重
│   ├── spider_project/            # 爬虫项目
│   │   ├── data_clean.py          # 数据清洗
│   │   ├── excel_to_mysql.py      # Excel导入MySQL
│   │   ├── spider_lianjia_每爬取10页存档一次.py # 链家爬虫
│   │   ├── script/                # 脚本文件
│   │   └── 爬取的数据/            # 爬取数据存储
│   ├── rendering/                 # 前端可视化
│   │   ├── src/                   # 源代码
│   │   │   ├── App.vue            # 主应用组件
│   │   │   ├── main.ts            # 应用入口
│   │   │   └── components/        # Vue组件
│   │   │       └── TwoDCharts.vue # 图表组件
│   │   ├── public/                # 静态资源
│   │   │   ├── house_data.json    # 房源数据
│   │   │   ├── house_data.csv     # 房源数据CSV
│   │   │   └── area_coordinates.json # 区域坐标
│   │   ├── util/                  # 工具脚本
│   │   │   ├── dataParser.ts      # 数据解析器
│   │   │   ├── xlsx转csv.ts       # Excel转CSV
│   │   │   └── xlsx转json.ts      # Excel转JSON
│   │   ├── doc/                   # 项目文档
│   │   ├── Dockerfile             # Docker配置
│   │   ├── docker-compose.yml     # Compose配置
│   │   ├── nginx.conf             # Nginx配置
│   │   ├── package.json           # 项目配置
│   │   └── vite.config.ts         # Vite配置
│   └── requirements.txt           # Python依赖
├── .github/                       # GitHub配置
├── .gitignore                     # Git忽略文件
└── README.md                      # 项目说明
```

## 📊 数据可视化功能

- **房价分析** - 价格分布和趋势
- **区域热力图** - 房源密度和价格分布  
- **关注度分析** - 关注人数与价格、面积关系
- **户型统计** - 不同房型的数量和价格对比
- **多维度关联** - 房源特征关联分析

## 🛠️ Docker管理命令

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs dpv-shp_beijing

# 停止容器
docker stop dpv-shp_beijing

# 删除容器  
docker rm dpv-shp_beijing

# Compose 管理
docker-compose ps
docker-compose logs -f
docker-compose down
```

## 🔗 相关链接

- **GitHub**: https://github.com/sakimi-9/DPV-SHP_BeiJing
- **Docker Hub**: https://hub.docker.com/r/sakimi9/dpv-shp_beijing
