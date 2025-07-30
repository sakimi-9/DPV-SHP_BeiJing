@echo off
REM 切换到项目根目录（假设bat在script目录下）
cd /d %~dp0\..\..\..

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