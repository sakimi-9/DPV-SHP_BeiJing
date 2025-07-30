# _*_ coding : utf-8 _*_
# @Time : 2025/3/31 19:15
# @Author : 张振哲
# @File : spider_lianjia_每爬取10页存档一次
# @Project : spider_project


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
        self.delay_range = (1, 5)  # 随机延时的范围（稍微扩大）
        
        # User-Agent 池，每次请求随机选择一个
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.48 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
        ]

        # !!! 重要：Cookie 需要定期从浏览器更新 !!!
        # 固定的Cookie很快会失效，导致被反爬
        self.cookie = 'lianjia_uuid=0a245c01-0249-4548-a9de-66e6367fdd82; _ga=GA1.2.1314715887.1743086781; _ga_EYZV9X59TQ=GS1.2.1743086782.1.1.1743086797.0.0.0; _ga_DX18CJBZRT=GS1.2.1743086782.1.1.1743086797.0.0.0; _ga_BKB2RJCQXZ=GS1.2.1743088349.1.0.1743088349.0.0.0; Qs_lvt_200116=1743090960; Qs_pv_200116=3209232641914898400%2C2610558853758770700%2C2860350900287569000%2C2313803583990493000; _ga_E91JCCJY3Z=GS1.2.1743090925.1.1.1743091086.0.0.0; _ga_MFYNHLJT0H=GS1.2.1743090925.1.1.1743091086.0.0.0; Hm_lvt_46bf127ac9b856df503ec2dbf942b67e=1743086769,1743327950; HMACCOUNT=37989191F901F592; _jzqc=1; _qzjc=1; _gid=GA1.2.1869468630.1743327970; crosSdkDT2019DeviceId=-2gp41z-o3lzyu-63pkn8jey4ausm7-e52x58qto; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22195d81156b0581-08cc2e949a02e-4c657b58-1821369-195d81156b125a3%22%2C%22%24device_id%22%3A%22195d81156b0581-08cc2e949a02e-4c657b58-1821369-195d81156b125a3%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E8%87%AA%E7%84%B6%E6%90%9C%E7%B4%A2%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fcn.bing.com%2F%22%2C%22%24latest_referrer_host%22%3A%22cn.bing.com%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%7D%7D; select_city=110000; _jzqckmp=1; lfrc_=7ac40290-a05f-4af6-a343-5cf68223992f; lianjia_ssid=cef6d138-2a67-4902-825c-acca81cd9b18; hip=ZqJNHesc-q8M-cLKVXS1DczLesgAfOukX5k-TW536DddyCxdjzFacxTuoT6OFIL9zPCvPoLBTCWdqch3wo14TobVAlrneXVkD5LWjb5-nAG_Okvr3CEe251SMxD8pkD4Vk97E8DHYOWUUedxHu-_FUOV3EytI2WFqr0wcAcr75y_KMth0Pay2WVBDA%3D%3D; _jzqa=1.2936646379323121700.1743086770.1743413095.1743417476.5; _jzqx=1.1743086770.1743417476.3.jzqsr=hip%2Elianjia%2Ecom|jzqct=/.jzqsr=bj%2Elianjia%2Ecom|jzqct=/; login_ucid=2000000475594965; lianjia_token=2.00143e639042ce0ea905934aa172e74f88; lianjia_token_secure=2.00143e639042ce0ea905934aa172e74f88; security_ticket=kJTW0O78ZiEbLJdC52BMmhOVWkmk+JRY2VbTz+6M2fz1Vedzx57t0Cl+jZLbTTOORFvFDMaoSp6PYHT3+SQQLgTcNO41eMPcXvJsnkTzR9Hqr2n5WPsbYyuvEOcmJosQmPuEdxqV3I/kaNM5vhlwEd9fjJFTlx5FHUZkfBZVb6E=; ftkrc_=49b169b'

        }

    async def scrape(self, url):
        async with self.semaphore:
            delay = random.uniform(*self.delay_range)
            await asyncio.sleep(delay)  # 延时
            timeout = aiohttp.ClientTimeout(total=60)  # 设置超时时间为60秒
            
            # 随机选择一个User-Agent
            headers = self.header.copy()
            headers['User-Agent'] = random.choice(self.user_agents)

            async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
                try:
                    logging.info(f"正在请求: {url}")
                    async with session.get(url) as response:
                        logging.info(f"请求完成: {url}, 状态码: {response.status}")
                        response.raise_for_status()  # 检查请求是否成功
                        return await response.text()
                except asyncio.TimeoutError:
                    logging.error(f"请求超时: {url}")
                except aiohttp.ClientError as e:
                    # 捕获aiohttp客户端错误，并尝试打印响应URL
                    status = e.status if hasattr(e, 'status') else 'N/A'
                    response_url = e.request_info.url if hasattr(e, 'request_info') and e.request_info else 'N/A'
                    logging.error(f"请求失败: {url}, 状态码: {status}, 响应URL: {response_url}, 错误: {e}")
                except Exception as e:
                    logging.error(f"请求 {url} 时发生未知错误: {e}")
                return None

    async def scrape_index(self, page):
        url = f"https://bj.lianjia.com/ershoufang/pg{page}/"
        text = await self.scrape(url)
        if text:
            await self.parse(text)
        else:
             logging.warning(f"未获取到 {url} 的页面内容，可能被反爬或请求失败。") # 增加日志

    async def parse(self, text):
        html = etree.HTML(text)
        lis = html.xpath('//*[@id="content"]/div[1]/ul/li')
        
        if not lis:
            logging.warning("解析结果为空，XPath可能不匹配或页面内容异常。") # 增加日志
            return

        for li in lis:
            try:
                house_data = li.xpath('.//div[@class="title"]/a/text()')[0]  # 房源
                house_info = li.xpath('.//div[@class="houseInfo"]/text()')[0]  # 房子信息
                address = " ".join(
                    li.xpath('.//div[@class="positionInfo"]/a/text()')
                )  # 位置信息
                price = li.xpath('.//div[@class="priceInfo"]/div[2]/span/text()')[ # 单价 元/平米
                    0
                ]
                attention_num = li.xpath('.//div[@class="followInfo"]/text()')[ # 关注人数和发布时间
                    0
                ]
                tag = " ".join(li.xpath('.//div[@class="tag"]/span/text()'))  # 标签
                sheet.append(
                    [house_data, house_info, address, price, attention_num, tag]
                )
                # logging.info([house_data, house_info, address, price, attention_num, tag]) # 避免日志过多

                # 每次爬取完一页后保存文件到指定目录
                save_dir = os.path.join(os.path.dirname(__file__), "爬取的数据")
                if not os.path.exists(save_dir):
                    os.makedirs(save_dir)
                file_name = os.path.join(save_dir, "house_data_8.xlsx")
                wb.save(file_name)
                logging.info('数据已保存到 ' + file_name)

            except IndexError:
                # logging.warning("解析单个房源时发生IndexError，跳过此项。") # 增加日志
                continue  # 忽略空白或错误的房源数据
            except Exception as e:
                 logging.error(f"解析单个房源时发生未知错误: {e}") # 增加日志

    async def main(self, start_page, stop_page):
        scrape_index_tasks = []
        for page in range(start_page, stop_page + 1):
            scrape_index_tasks.append(asyncio.ensure_future(self.scrape_index(page)))

        # 执行所有页面爬取任务
        # loop = asyncio.get_event_loop() # 已废弃，asyncio.run会自动创建和管理event loop
        tasks = asyncio.gather(*scrape_index_tasks)
        await tasks


if __name__ == "__main__":
    spider = Spider()
    logging.info("爬虫启动")
    # 设置爬取页数为1到2，便于调试，如需更多页请修改此处
    asyncio.run(spider.main(start_page=1, stop_page=2)) 
    end = datetime.datetime.now()
    logging.info(f"爬取结束, 总耗时: {end - start}")
