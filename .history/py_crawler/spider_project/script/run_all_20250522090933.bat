@echo off
chcp 65001 >nul

REM 切换到项目根目录并安装依赖
cd /d "d:\链家二手房爬虫\"
pip install -r requirements.txt

REM 切换到脚本目录
cd /d "d:\链家二手房爬虫\py_crawler\spider_project\"

REM 1. 执行更改城市地址的脚本
python change_city.py

REM 2. 运行爬虫程序
python spider_lianjia_每爬取10页存档一次.py

REM 3. 运行数据处理程序
python data_clean.py

REM 4. 运行数据入库程序
python excel_to_mysql.py

pause