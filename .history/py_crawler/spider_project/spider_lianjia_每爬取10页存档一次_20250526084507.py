import asyncio
import aiohttp
from lxml import etree
import pandas as pd
import logging
import datetime
import openpyxl
import random
import os

wb = openpyxl.Workbook()
sheet = wb.active
sheet.append(["房源", "房子信息", "所在区域", "单价", "关注人数和发布时间", "标签"])
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s: %(message)s"
)
start = datetime.datetime.now()


class Spider(object):
    def __init__(self):
        self.semaphore = asyncio.Semaphore(1)  # 信号量，控制协程数，防止爬得过快被反爬
        self.delay_range = (0.5, 3)  # 随机延时的范围
        self.header = {
            "Host": "bj.lianjia.com",
            "Referer": "https://bj.lianjia.com/ershoufang/",
            "Cookie": "lianjia_ssid=d8436efa-75ac-41f9-8048-1f7cc48ee5e3; expires=Mon, 26-May-25 01:06:19 GMT; Max-Age=1800; domain=.lianjia.com; path=/",
            "User-Agent": '"User - Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"',
        }

    async def scrape(self, url):
        async with self.semaphore:
            delay = random.uniform(*self.delay_range)
            await asyncio.sleep(delay)  # 延时
            timeout = aiohttp.ClientTimeout(total=60)  # 设置超时时间为60秒
            async with aiohttp.ClientSession(
                headers=self.header, timeout=timeout
            ) as session:
                try:
                    response = await session.get(url)
                    response.raise_for_status()  # 检查请求是否成功
                    return await response.text()
                except asyncio.TimeoutError:
                    logging.error(f"Timeout occurred for {url}")
                except aiohttp.ClientError as e:
                    logging.error(f"Request failed for {url} with error: {e}")
                return None

    async def scrape_index(self, page):
        url = f"https://bj.lianjia.com/ershoufang/pg{page}/"
        text = await self.scrape(url)
        if text:
            await self.parse(text)

    async def parse(self, text):
        html = etree.HTML(text)
        lis = html.xpath('//*[@id="content"]/div[1]/ul/li')
        for li in lis:
            try:
                house_data = li.xpath('.//div[@class="title"]/a/text()')[0]  # 房源
                house_info = li.xpath('.//div[@class="houseInfo"]/text()')[
                    0
                ]  # 房子信息
                address = " ".join(
                    li.xpath('.//div[@class="positionInfo"]/a/text()')
                )  # 位置信息
                price = li.xpath('.//div[@class="priceInfo"]/div[2]/span/text()')[
                    0
                ]  # 单价 元/平米
                attention_num = li.xpath('.//div[@class="followInfo"]/text()')[
                    0
                ]  # 关注人数和发布时间
                tag = " ".join(li.xpath('.//div[@class="tag"]/span/text()'))  # 标签
                sheet.append(
                    [house_data, house_info, address, price, attention_num, tag]
                )
                logging.info(
                    [house_data, house_info, address, price, attention_num, tag]
                )

                # 每次爬取完一页后保存文件到指定目录
                save_dir = os.path.join(os.path.dirname(__file__), "爬取的数据")
                if not os.path.exists(save_dir):
                    os.makedirs(save_dir)
                file_name = os.path.join(save_dir, "house_data_8.xlsx")
                wb.save(file_name)
                logging.info("Data saved to " + file_name)

            except IndexError:
                continue  # 忽略空白或错误的房源数据

    async def main(self, start_page, stop_page):
        scrape_index_tasks = []
        for page in range(start_page, stop_page + 1):
            scrape_index_tasks.append(asyncio.ensure_future(self.scrape_index(page)))

        # 执行所有页面爬取任务
        loop = asyncio.get_event_loop()
        tasks = asyncio.gather(*scrape_index_tasks)
        await tasks


if __name__ == "__main__":
    spider = Spider()
    logging.info("爬虫启动")
    asyncio.run(spider.main(start_page=6, stop_page=10))  # 设置爬取页数为1到5，
    end = datetime.datetime.now()
    logging.info(f"爬取结束, 总耗时: {end - start}")
