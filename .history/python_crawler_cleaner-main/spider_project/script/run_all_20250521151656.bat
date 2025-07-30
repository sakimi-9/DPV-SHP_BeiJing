@echo off
REM 获取当前bat脚本所在的目录
set SCRIPT_DIR=%~dp0

REM 切换到项目根目录（假设项目根目录在bat脚本所在目录的上三级）
cd /d "%SCRIPT_DIR%\..\..\.."

REM 打印当前工作目录，方便调试
echo Current directory: %cd%

REM 安装依赖
pip install -r requirements.txt
pip install pymysql

REM 运行爬虫
python python_crawler_cleaner-main\spider_project\spider_lianjia_save_every_10_pages.py

REM 运行数据处理
python python_crawler_cleaner-main\spider_project\data_clean.py

REM 运行数据入库
python python_crawler_cleaner-main\spider_project\excel_to_mysql.py

pause