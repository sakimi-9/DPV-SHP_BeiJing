 @echo off
chcp 65001 >nul

REM 1. 运行爬虫程序
python python_crawler_cleaner-main\spider_project\spider_lianjia_每爬取10页存档一次.py

REM 2. 运行数据处理程序（如有，可修改为实际处理脚本名）
python python_crawler_cleaner-main\spider_project\data_clean.py

REM 3. 运行数据入库程序
python python_crawler_cleaner-main\spider_project\excel_to_mysql.py

pause