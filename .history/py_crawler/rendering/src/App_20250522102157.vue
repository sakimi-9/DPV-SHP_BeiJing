<template>
  <div>
    <h1>二手房数据可视化</h1>

    <!-- 模式切换 UI -->
    <div>
      <button @click="currentMode = '2D'" :disabled="currentMode === '2D'">2D 模式</button>
      <button @click="currentMode = '3D'" :disabled="currentMode === '3D'">3D 模式</button>
    </div>

    <!-- 2D 图表区域 -->
    <div v-if="currentMode === '2D'">
      <h2>2D 图表</h2>
      <!-- 各区域房源数量统计 (已有的) -->
      <h3>各区域房源数量统计</h3>
      <div ref="areaChartContainer" style="width: 800px; height: 500px;"></div>

      <!-- 单价分布直方图 -->
      <h3>单价分布</h3>
      <div ref="priceHistContainer" style="width: 800px; height: 500px;"></div>

      <!-- 面积分布直方图 -->
      <h3>面积分布</h3>
      <div ref="areaHistContainer" style="width: 800px; height: 500px;"></div>

      <!-- 户型统计 -->
      <h3>户型统计</h3>
      <div ref="unitTypeChartContainer" style="width: 800px; height: 500px;"></div>

      <!-- 关注人数与单价散点图 -->
      <h3>关注人数与单价关系</h3>
      <div ref="followPriceScatterContainer" style="width: 800px; height: 500px;"></div>

      <!-- 关注人数与面积散点图 -->
      <h3>关注人数与面积关系</h3>
      <div ref="followAreaScatterContainer" style="width: 800px; height: 500px;"></div>
    </div>

    <!-- 3D 图表区域 (待实现) -->
    <div v-if="currentMode === '3D'">
      <h2>3D 图表</h2>
      <!-- Three.js 3D 可视化将在这里实现 -->
      <p>3D 可视化功能待开发...</p>
      <div ref="threeContainer" style="width: 800px; height: 500px; border: 1px solid #ccc;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
// Import the dataTool module explicitly
import * as dataTool from 'echarts/lib/dataTool';
// Three.js 将在 3D 模式实现时导入
// import * as THREE from 'three';

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

// 定义图表容器的引用
const areaChartContainer = ref<HTMLElement | null>(null);
const priceHistContainer = ref<HTMLElement | null>(null);
const areaHistContainer = ref<HTMLElement | null>(null);
const unitTypeChartContainer = ref<HTMLElement | null>(null);
const followPriceScatterContainer = ref<HTMLElement | null>(null);
const followAreaScatterContainer = ref<HTMLElement | null>(null);
const threeContainer = ref<HTMLElement | null>(null); // 3D 容器

// 定义当前模式状态
const currentMode = ref<'2D' | '3D'>('2D');

// 绘制各区域房源数量统计图 (已有的逻辑，稍作修改)
function renderAreaChart(data: ParsedHouse[]) {
  if (!areaChartContainer.value) return;

  const areaCounts: { [key: string]: number } = {};
  data.forEach((item: ParsedHouse) => {
    if (item.所在区域) {
      areaCounts[item.所在区域] = (areaCounts[item.所在区域] || 0) + 1;
    }
  });

  const areas = Object.keys(areaCounts);
  const counts = Object.values(areaCounts);

  const myChart = echarts.init(areaChartContainer.value);
  const option = {
    title: {
      text: '各区域房源数量统计',
      left: 'center'
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: areas,
      axisLabel: { // 旋转 x 轴标签，避免重叠
        interval: 0,
        rotate: 30,
        overflow: 'breakAll',
        ellipsis: '...'
      }
    },
    yAxis: {
      type: 'value'
    },
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

// Function to draw the unit price distribution histogram
const drawUnitPriceDistributionChart = (chartElement: HTMLElement, parsedData: ParsedHouse[]) => {
  const prices = parsedData.map(house => house.单价);
  // Use dataTool.histogram
  const histogramData = dataTool.histogram(prices);
  const data = histogramData.data;
  const bins = histogramData.bins;

  const chart = echarts.init(chartElement);
  const options = {
    title: { text: '单价分布' },
    tooltip: {},
    xAxis: { type: 'category', data: bins.map((bin: { interval: number[]; }) => `${bin.interval[0]}-${bin.interval[1]}`) },
    yAxis: { type: 'value' },
    series: [{
      // Add type annotation for item: [value, count]
      data: data.map((item: [number, number]) => item[1]),
      type: 'bar'
    }]
  };
  chart.setOption(options);
};

// Function to draw the size distribution histogram
const drawSizeDistributionChart = (chartElement: HTMLElement, parsedData: ParsedHouse[]) => {
  const sizes = parsedData.map(house => house.面积);
  // Use dataTool.histogram
  const histogramData = dataTool.histogram(sizes);
  const data = histogramData.data;
  const bins = histogramData.bins;

  const chart = echarts.init(chartElement);
  const options = {
    title: { text: '面积分布' },
    tooltip: {},
    xAxis: { type: 'category', data: bins.map((bin: { interval: number[]; }) => `${bin.interval[0]}-${bin.interval[1]}`) },
    yAxis: { type: 'value' },
    series: [{
      // Add type annotation for item: [value, count]
      data: data.map((item: [number, number]) => item[1]),
      type: 'bar'
    }]
  };
  chart.setOption(options);
};

// 绘制户型统计图 (饼图示例)
function renderUnitTypeChart(data: ParsedHouse[]) {
  if (!unitTypeChartContainer.value) return;

  const unitTypeCounts: { [key: string]: number } = {};
  data.forEach((item: ParsedHouse) => {
    if (item.室 !== null && item.厅 !== null) {
      const unitType = `${item.室}室${item.厅}厅`;
      unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
    } else if (item.室 !== null) { // 只有室的情况
      const unitType = `${item.室}室`;
      unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
    } else if (item.厅 !== null) { // 只有厅的情况
      const unitType = `${item.厅}厅`;
      unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
    }
  });

  const chartData = Object.keys(unitTypeCounts).map(type => ({
    name: type,
    value: unitTypeCounts[type]
  }));

  const myChart = echarts.init(unitTypeChartContainer.value);
  const option = {
    title: {
      text: '户型统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '户型',
        type: 'pie',
        radius: '50%',
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  myChart.setOption(option);
}

// 绘制关注人数与单价散点图
function renderFollowPriceScatter(data: ParsedHouse[]) {
  if (!followPriceScatterContainer.value) return;

  const scatterData = data
    .filter(item => item.关注人数 !== null && item.单价 !== null)
    .map(item => [item.单价, item.关注人数]); // [x: 单价, y: 关注人数]

  const myChart = echarts.init(followPriceScatterContainer.value);
  const option = {
    title: {
      text: '关注人数与单价关系',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const item = params[0];
        const originalItem = data.find(d => d.单价 === item.value[0] && d.关注人数 === item.value[1]);
        if (originalItem) {
          return `房源: ${originalItem.房源标题}<br/>单价: ${item.value[0]} 元/平<br/>关注人数: ${item.value[1]} 人`;
        } else {
          return `单价: ${item.value[0]} 元/平<br/>关注人数: ${item.value[1]} 人`;
        }
      }
    },
    xAxis: {
      type: 'value',
      name: '单价 (元/平)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'value',
      name: '关注人数',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '房源',
        type: 'scatter',
        data: scatterData
      }
    ]
  };
  myChart.setOption(option);
}

// 绘制关注人数与面积散点图
function renderFollowAreaScatter(data: ParsedHouse[]) {
  if (!followAreaScatterContainer.value) return;

  const scatterData = data
    .filter(item => item.关注人数 !== null && item.面积 !== null)
    .map(item => [item.面积, item.关注人数]); // [x: 面积, y: 关注人数]

  const myChart = echarts.init(followAreaScatterContainer.value);
  const option = {
    title: {
      text: '关注人数与面积关系',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const item = params[0];
        const originalItem = data.find(d => d.面积 === item.value[0] && d.关注人数 === item.value[1]);
        if (originalItem) {
          return `房源: ${originalItem.房源标题}<br/>面积: ${item.value[0]} 平米<br/>关注人数: ${item.value[1]} 人`;
        } else {
          return `面积: ${item.value[0]} 平米<br/>关注人数: ${item.value[1]} 人`;
        }
      }
    },
    xAxis: {
      type: 'value',
      name: '面积 (平米)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'value',
      name: '关注人数',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '房源',
        type: 'scatter',
        data: scatterData
      }
    ]
  };
  myChart.setOption(option);
}

onMounted(async () => {
  // 加载原始数据
  try {
    const response = await fetch('/house_data.json');
    const rawHouseData = await response.json();

    // 解析数据
    const parsedHouseData = parseHouseData(rawHouseData);

    console.log('解析后的数据:', parsedHouseData); // 打印解析后的数据以便检查

    // 绘制 2D 图表
    if (currentMode.value === '2D') {
      renderAreaChart(parsedHouseData);
      drawUnitPriceDistributionChart(priceHistContainer.value, parsedHouseData);
      drawSizeDistributionChart(areaHistContainer.value, parsedHouseData);
      renderUnitTypeChart(parsedHouseData);
      renderFollowPriceScatter(parsedHouseData);
      renderFollowAreaScatter(parsedHouseData);
    }

    // TODO: 3D 图表绘制逻辑将在后续实现
    if (currentMode.value === '3D') {
      // renderThreeJSScene(parsedHouseData);
    }

  } catch (error) {
    console.error('加载或处理数据时发生错误:', error);
  }
});

</script>

<style scoped>
/* 组件样式 */
div {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}
</style>