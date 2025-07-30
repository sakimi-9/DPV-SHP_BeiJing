<template>
  <div>
    <h1>二手房数据可视化</h1>
    <!-- 添加一个 div 作为 Echarts 图表的容器 -->
    <div ref="chartContainer" style="width: 800px; height: 500px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

// 定义解析后的房源数据接口
interface ParsedHouse {
  房源标题: string;
  室: number | null;
  厅: number | null;
  面积: number | null; // 平米
  朝向: string | null;
  装修: string | null;
  楼层信息: string | null; // 例如 "中楼层"
  总楼层: number | null;
  建筑年份: number | null; // 例如 2012
  建筑类型: string | null; // 例如 "板塔结合"
  小区名称: string | null;
  所在区域: string | null; // 例如 "临河里"
  单价: number | null; // 元/平
  关注人数: number | null;
  发布时间: string | null; // 例如 "2个月以前发布"
  标签: string[];
}

// 数据解析函数
function parseHouseData(rawData: any[]): ParsedHouse[] {
  const parsedData: ParsedHouse[] = [];

  rawData.forEach(item => {
    const parsedItem: ParsedHouse = {
      房源标题: item['房源'] || '',
      室: null,
      厅: null,
      面积: null,
      朝向: null,
      装修: null,
      楼层信息: null,
      总楼层: null,
      建筑年份: null,
      建筑类型: null,
      小区名称: null,
      所在区域: null,
      单价: null,
      关注人数: null,
      发布时间: item['关注人数和发布时间'] ? item['关注人数和发布时间'].split(' / ')[1]?.trim() || null : null,
      标签: item['标签'] ? item['标签'].split(' ').filter((tag: string) => tag.trim() !== '') : [],
    };

    // 解析 "房子信息"
    const houseInfoParts = item['房子信息'] ? item['房子信息'].split(' | ').map((part: string) => part.trim()) : [];
    houseInfoParts.forEach((part: string) => {
      if (part.includes('室') && part.includes('厅')) {
        const match = part.match(/(\d+)室(\d+)厅/);
        if (match) {
          parsedItem.室 = parseInt(match[1], 10);
          parsedItem.厅 = parseInt(match[2], 10);
        }
      } else if (part.includes('平米')) {
        const match = part.match(/([\d\.]+)平米/);
        if (match) {
          parsedItem.面积 = parseFloat(match[1]);
        }
      } else if (part.includes('层') && part.includes('共')) {
        const match = part.match(/(.+)\(共(\d+)层\)/);
        if (match) {
          parsedItem.楼层信息 = match[1].trim();
          parsedItem.总楼层 = parseInt(match[2], 10);
        } else {
          // 处理只有总楼层没有楼层信息的情况，例如 "27层"
          const totalFloorsMatch = part.match(/(\d+)层/);
          if (totalFloorsMatch) {
            parsedItem.总楼层 = parseInt(totalFloorsMatch[1], 10);
          }
        }
      } else if (part.match(/\d{4}年/)) { // 建筑年份
        parsedItem.建筑年份 = parseInt(part, 10);
      } else if (part === '板楼' || part === '塔楼' || part === '板塔结合') { // 建筑类型
        parsedItem.建筑类型 = part;
      } else if (['东', '南', '西', '北', '东南', '东北', '西南', '西北'].some(dir => part.includes(dir))) { // 朝向
        parsedItem.朝向 = part; // 简单存储整个朝向字符串，后续可能需要更精细解析
      } else if (['毛坯', '简装', '精装', '其他'].some(dec => part.includes(dec))) { // 装修
        parsedItem.装修 = part;
      }
    });

    // 解析 "所在区域"
    const areaParts = item['所在区域'] ? item['所在区域'].split('  ').map((part: string) => part.trim()) : [];
    if (areaParts.length > 0) {
      parsedItem.小区名称 = areaParts[0];
      if (areaParts.length > 1) {
        parsedItem.所在区域 = areaParts[1];
      }
    }

    // 解析 "单价"
    const priceMatch = item['单价'] ? item['单价'].replace(',', '').match(/([\d\.]+)元\/平/) : null;
    if (priceMatch) {
      parsedItem.单价 = parseFloat(priceMatch[1]);
    }

    // 解析 "关注人数和发布时间"
    const followTimeParts = item['关注人数和发布时间'] ? item['关注人数和发布时间'].split(' / ').map((part: string) => part.trim()) : [];
    if (followTimeParts.length > 0) {
      const followMatch = followTimeParts[0].match(/(\d+)人关注/);
      if (followMatch) {
        parsedItem.关注人数 = parseInt(followMatch[1], 10);
      }
      // 发布时间已经在上面解析了
    }

    parsedData.push(parsedItem);
  });

  return parsedData;
}

const chartContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  // 加载原始数据
  try {
    const response = await fetch('/house_data.json');
    const rawHouseData = await response.json();

    // 解析数据
    const parsedHouseData = parseHouseData(rawHouseData);

    console.log('解析后的数据:', parsedHouseData); // 打印解析后的数据以便检查

    // 使用 Echarts 绘制图表示例 (使用解析后的数据)
    if (chartContainer.value) {
      const myChart = echarts.init(chartContainer.value);

      // 示例：按所在区域统计房源数量 (使用解析后的数据)
      const areaCounts: { [key: string]: number } = {};
      parsedHouseData.forEach((item: ParsedHouse) => {
        if (item.所在区域) {
          areaCounts[item.所在区域] = (areaCounts[item.所在区域] || 0) + 1;
        }
      });

      const areas = Object.keys(areaCounts);
      const counts = Object.values(areaCounts);

      const option = {
        title: {
          text: '各区域房源数量统计'
        },
        tooltip: {},
        xAxis: {
          data: areas,
          axisLabel: { // 旋转 x 轴标签，避免重叠
            interval: 0,
            rotate: 30,
            // 确保标签完整显示
            overflow: 'breakAll', // 或 'truncate'
            ellipsis: '...'
          }
        },
        yAxis: {},
        series: [
          {
            name: '房源数量',
            type: 'bar',
            data: counts
          }
        ]
      };
      myChart.setOption(option);
    }

  } catch (error) {
    console.error('加载或处理数据时发生错误:', error);
  }
});

</script>

<style scoped>
/* 组件样式 */
</style>