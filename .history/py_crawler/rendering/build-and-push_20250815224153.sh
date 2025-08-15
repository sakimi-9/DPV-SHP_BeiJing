#!/bin/bash

# 北京二手房数据可视化项目 - Docker 构建与推送脚本
# Build and Push Script for DPV-SHP Beijing Project

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置信息
IMAGE_NAME="sakimi9/dpv-shp_beijing"
CONTAINER_NAME="dpv-shp_beijing"
TAG=${1:-latest}
PORT=${2:-8080}

echo -e "${BLUE}🚀 北京二手房数据可视化项目 - Docker 构建与推送${NC}"
echo -e "${BLUE}================================================${NC}"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# 检查是否已登录 Docker Hub
echo -e "${YELLOW}🔐 检查 Docker Hub 登录状态...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  请先登录 Docker Hub:${NC}"
    echo "docker login"
    exit 1
fi

# 清理之前的构建缓存
echo -e "${YELLOW}🧹 清理构建缓存...${NC}"
docker builder prune -f > /dev/null 2>&1 || true

# 构建 Docker 镜像
echo -e "${YELLOW}🔨 构建 Docker 镜像: ${IMAGE_NAME}:${TAG}${NC}"
docker build \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:latest \
    --platform linux/amd64 \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功!${NC}"
else
    echo -e "${RED}❌ 镜像构建失败!${NC}"
    exit 1
fi

# 显示镜像信息
echo -e "${BLUE}📊 镜像信息:${NC}"
docker images ${IMAGE_NAME}

# 推送到 Docker Hub
echo -e "${YELLOW}⬆️  推送镜像到 Docker Hub...${NC}"
docker push ${IMAGE_NAME}:${TAG}

if [ "${TAG}" != "latest" ]; then
    docker push ${IMAGE_NAME}:latest
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像推送成功!${NC}"
else
    echo -e "${RED}❌ 镜像推送失败!${NC}"
    exit 1
fi

# 停止并删除现有容器（如果存在）
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}🛑 停止现有容器...${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
fi

# 运行新容器
echo -e "${YELLOW}🚀 启动新容器...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:80 \
    --restart unless-stopped \
    ${IMAGE_NAME}:${TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 容器启动成功!${NC}"
    echo -e "${GREEN}🌐 应用访问地址: http://localhost:${PORT}${NC}"
else
    echo -e "${RED}❌ 容器启动失败!${NC}"
    exit 1
fi

# 显示容器状态
echo -e "${BLUE}📋 容器状态:${NC}"
docker ps --filter "name=${CONTAINER_NAME}"

# 显示使用说明
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}📱 使用说明:${NC}"
echo -e "  • 访问应用: ${GREEN}http://localhost:${PORT}${NC}"
echo -e "  • 查看日志: ${YELLOW}docker logs ${CONTAINER_NAME}${NC}"
echo -e "  • 停止容器: ${YELLOW}docker stop ${CONTAINER_NAME}${NC}"
echo -e "  • 删除容器: ${YELLOW}docker rm ${CONTAINER_NAME}${NC}"
echo ""
echo -e "${BLUE}🐳 Docker Hub:${NC}"
echo -e "  • 镜像地址: ${GREEN}https://hub.docker.com/r/${IMAGE_NAME}${NC}"
echo -e "  • 拉取命令: ${YELLOW}docker pull ${IMAGE_NAME}:${TAG}${NC}"
