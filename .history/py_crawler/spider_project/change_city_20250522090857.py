import os


def change_crawl_city(file_path, old_city_code, new_city_code):
    """
    修改指定爬虫文件中硬编码的城市代码

    Args:
        file_path (str): 爬虫文件的路径
        old_city_code (str): 当前文件中的城市代码 (例如 'bj')
        new_city_code (str): 要更改为的新城市代码 (例如 'hz')
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 使用简单的替换，这里假设城市代码是在URL中以 "/旧城市代码/" 形式出现的
        # 如果代码中有其他地方使用了城市代码需要更复杂的替换逻辑
        modified_content = content.replace(f"/{old_city_code}/", f"/{new_city_code}/")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(modified_content)

        print(
            f"成功将文件 {file_path} 中的城市代码从 '{old_city_code}' 更改为 '{new_city_code}'。"
        )

    except FileNotFoundError:
        print(f"错误：找不到文件 {file_path}")
    except Exception as e:
        print(f"修改文件时发生错误: {e}")


if __name__ == "__main__":
    crawler_file = "spider_lianjia_每爬取10页存档一次.py"  # 您的爬虫文件名
    crawler_path = os.path.join(os.path.dirname(__file__), crawler_file)
    current_city = "bj"  # 爬虫文件中当前的城市代码

    new_city = input(
        f"请输入新的目标城市两字母代码 (当前为 '{current_city}')："
    ).lower()

    if len(new_city) == 2 and new_city.isalpha():
        change_crawl_city(crawler_path, current_city, new_city)
    else:
        print("输入无效，请输入两个字母的城市代码。")
