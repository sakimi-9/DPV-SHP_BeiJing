import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelFilePath = 'D:\\链家二手房爬虫\\py_crawler\\spider_project\\爬取的数据\\house_cleared_8.xlsx'; // 替换为你的 Excel 文件实际路径
const csvOutputFilePath = path.join('D:\\链家二手房爬虫\\py_crawler\\rendering\\public', 'house_data.csv'); // 输出 CSV 文件到指定目录

try {
    // 读取 Excel 文件
    const workbook = XLSX.readFile(excelFilePath);

    // 获取第一个工作表的名称
    const sheetName = workbook.SheetNames[0];

    // 获取工作表
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表数据转换为 CSV 字符串
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    // 将 CSV 数据写入文件
    fs.writeFileSync(csvOutputFilePath, csvData, 'utf-8');

    console.log(`成功将数据从 ${excelFilePath} 转换为 CSV，并保存到 ${csvOutputFilePath}`);
} catch (error) {
    console.error(`转换过程中发生错误: ${error}`);
}
