@echo off
chcp 65001 >nul

REM 安装项目依赖
pip install -r d:\链家二手房爬虫\requirements.txt

REM 1. 执行更改城市地址的脚本
python d:\链家二手房爬虫\py_crawler\spider_project\change_city.py

REM 2. 运行数据爬取程序
python d:\链家二手房爬虫\py_crawler\spider_project\spider_lianjia_每爬取10页存档一次.py

REM 3. 运行数据处理程序
python d:\链家二手房爬虫\py_crawler\spider_project\data_clean.py

REM 4. 运行数据入库程序
python d:\链家二手房爬虫\py_crawler\spider_project\excel_to_mysql.py

pause