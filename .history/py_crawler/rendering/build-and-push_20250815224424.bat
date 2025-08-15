@echo off
setlocal EnableDelayedExpansion

:: 北京二手房数据可视化项目 - Docker 构建与推送脚本 (Windows)
:: Build and Push Script for DPV-SHP Beijing Project (Windows)

echo.
echo 🚀 北京二手房数据可视化项目 - Docker 构建与推送
echo ================================================

:: 配置信息
set IMAGE_NAME=sakimi9/dpv-shp_beijing
set CONTAINER_NAME=dpv-shp_beijing
set TAG=%1
set PORT=%2

if "%TAG%"=="" set TAG=latest
if "%PORT%"=="" set PORT=8080

:: 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

:: 清理之前的构建缓存
echo 🧹 清理构建缓存...
docker builder prune -f >nul 2>&1

:: 构建 Docker 镜像
echo 🔨 构建 Docker 镜像: %IMAGE_NAME%:%TAG%
docker build --tag %IMAGE_NAME%:%TAG% --tag %IMAGE_NAME%:latest --platform linux/amd64 .

if errorlevel 1 (
    echo ❌ 镜像构建失败!
    pause
    exit /b 1
)

echo ✅ 镜像构建成功!

:: 显示镜像信息
echo.
echo 📊 镜像信息:
docker images %IMAGE_NAME%

:: 推送到 Docker Hub
echo.
echo ⬆️  推送镜像到 Docker Hub...
docker push %IMAGE_NAME%:%TAG%

if not "%TAG%"=="latest" (
    docker push %IMAGE_NAME%:latest
)

if errorlevel 1 (
    echo ❌ 镜像推送失败!
    pause
    exit /b 1
)

echo ✅ 镜像推送成功!

:: 停止并删除现有容器（如果存在）
docker ps -a --format "table {{.Names}}" | findstr /c:"%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    echo 🛑 停止现有容器...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
)

:: 运行新容器
echo 🚀 启动新容器...
docker run -d --name %CONTAINER_NAME% -p %PORT%:80 --restart unless-stopped %IMAGE_NAME%:%TAG%

if errorlevel 1 (
    echo ❌ 容器启动失败!
    pause
    exit /b 1
)

echo ✅ 容器启动成功!
echo 🌐 应用访问地址: http://localhost:%PORT%

:: 显示容器状态
echo.
echo 📋 容器状态:
docker ps --filter "name=%CONTAINER_NAME%"

:: 显示使用说明
echo.
echo ================================================
echo 🎉 部署完成！
echo.
echo 📱 使用说明:
echo   • 访问应用: http://localhost:%PORT%
echo   • 查看日志: docker logs %CONTAINER_NAME%
echo   • 停止容器: docker stop %CONTAINER_NAME%
echo   • 删除容器: docker rm %CONTAINER_NAME%
echo.
echo 🐳 Docker Hub:
echo   • 镜像地址: https://hub.docker.com/r/%IMAGE_NAME%
echo   • 拉取命令: docker pull %IMAGE_NAME%:%TAG%
echo.

pause
