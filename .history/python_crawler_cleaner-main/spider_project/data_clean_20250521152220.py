import pandas as pd
import os


def remove_duplicate_rows(input_file, output_file):
    """
    读取Excel文件，删除完全重复的行，保存结果到新文件
    :param input_file: 输入文件名（xlsx格式）
    :param output_file: 输出文件名（xlsx格式）
    """
    try:
        print(f"正在读取文件: {input_file}")
        df = pd.read_excel(input_file)
        print(f"读取成功，原始行数: {df.shape[0]}")

        # 记录原始行数
        original_rows = df.shape[0]

        # 删除完全重复的行（保留第一次出现的行）
        df.drop_duplicates(inplace=True)

        # 保存处理后的数据到新文件
        df.to_excel(output_file, index=False)

        # 统计信息
        removed_rows = original_rows - df.shape[0]
        print(f"处理完成！共删除 {removed_rows} 个重复行")
        print(f"原始行数: {original_rows}，处理后行数: {df.shape[0]}")
        print(f"结果已保存到: {output_file}")
    except FileNotFoundError:
        print(f"错误：未找到文件 {input_file}")
    except Exception as e:
        print(f"处理文件时发生错误: {e}")


# 使用示例
if __name__ == "__main__":
    # 读取爬虫保存的原始数据文件
    # 使用 os.path.join 和 os.path.dirname(__file__) 确保路径相对于当前脚本位置
    script_dir = os.path.dirname(__file__)
    input_filename = os.path.join(script_dir, "爬取的数据", "house_data_8.xlsx")
    # 清洗后保存的文件名
    output_filename = os.path.join(script_dir, "house_data_8_cleaned.xlsx")

    remove_duplicate_rows(input_filename, output_filename)
