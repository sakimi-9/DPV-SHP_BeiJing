import pandas as pd
import pymysql

try:
    print("读取Excel...")
    file_path = (
        r"D:\链家二手房爬虫\py_crawler\spider_project\爬取的数据\house_cleared_8.xlsx"
    )
    df = pd.read_excel(file_path)
    print(f"数据行数: {len(df)}")

    print("连接MySQL...")
    conn = pymysql.connect(
        host="localhost",
        port=3306,
        user="root",
        password="123456",
        database="py_crawler",
        charset="utf8mb4",
    )
    cursor = conn.cursor()

    print("创建表...")
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS house_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        房源 VARCHAR(255),
        房子信息 VARCHAR(255),
        所在区域 VARCHAR(255),
        单价 VARCHAR(255),
        关注人数和发布时间 VARCHAR(255),
        标签 VARCHAR(255)
    ) CHARSET=utf8mb4;
    """
    cursor.execute(create_table_sql)

    print("插入数据...")
    insert_sql = """
    INSERT INTO house_data (房源, 房子信息, 所在区域, 单价, 关注人数和发布时间, 标签)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    for _, row in df.iterrows():
        cursor.execute(insert_sql, tuple(row))
    conn.commit()
    cursor.close()
    conn.close()
    print("数据已成功导入MySQL数据库！")
except Exception as e:
    print("发生错误:", e)
