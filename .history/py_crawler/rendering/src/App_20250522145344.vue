<template>
  <div>
    <h1>二手房数据可视化</h1>

    <!-- 模式切换 UI -->
    <div>
      <button @click="currentMode = '2D'" :disabled="currentMode === '2D'">2D 模式</button>
      <button @click="currentMode = '3D'" :disabled="currentMode === '3D'">3D 模式</button>
    </div>

    <!-- 2D 图表区域 -->
    <TwoDCharts v-if="currentMode === '2D'" :house-data="houseData" />

    <!-- 3D 图表区域 -->
    <ThreeDVisualization v-if="currentMode === '3D'" :house-data="houseData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 导入新组件
import TwoDCharts from './components/TwoDCharts.vue';
import ThreeDVisualization from './components/ThreeDVisualization.vue';

// 定义解析后的房源数据接口 (保留接口定义，添加经纬度)
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
  // 添加经纬度信息
  location?: { lng: number; lat: number };
}

// 定义一个 Map 来存储区域名称到经纬度的映射
const areaCoordinatesMap = new Map<string, { lng: number; lat: number }>();

// 加载经纬度数据并构建 Map
async function loadAreaCoordinates() {
  try {
    const response = await fetch('/area_coordinates.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const coordinatesData = await response.json();
    // 假设 coordinatesData 是一个数组，每个元素有 name, region, location
    coordinatesData.forEach((item: any) => {
      if (item.name && item.region && item.location) {
        // 使用 小区名称 所在区域 作为 key
        const key = `${item.name}  ${item.region}`;
        areaCoordinatesMap.set(key, item.location);
      }
    });
    console.log('经纬度数据加载并存储到 Map:', areaCoordinatesMap);
  } catch (error) {
    console.error('Error loading area coordinates data:', error);
  }
}

// 数据解析函数 (修改：查找并添加经纬度)
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
      location: undefined, // 初始化 location 为 undefined
    };

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
          const totalFloorsMatch = part.match(/(\d+)层/);
          if (totalFloorsMatch) {
            parsedItem.总楼层 = parseInt(totalFloorsMatch[1], 10);
          }
        }
      } else if (part.match(/\d{4}年/)) {
        parsedItem.建筑年份 = parseInt(part, 10);
      } else if (part === '板楼' || part === '塔楼' || part === '板塔结合') {
        parsedItem.建筑类型 = part;
      } else if (['东', '南', '西', '北', '东南', '东北', '西南', '西北'].some(dir => part.includes(dir))) {
        parsedItem.朝向 = part;
      } else if (['毛坯', '简装', '精装', '其他'].some(dec => part.includes(dec))) {
        parsedItem.装修 = part;
      }
    });

    const areaParts = item['所在区域'] ? item['所在区域'].split('  ').map((part: string) => part.trim()) : [];
    if (areaParts.length > 0) {
      parsedItem.小区名称 = areaParts[0];
      if (areaParts.length > 1) {
        parsedItem.所在区域 = areaParts[1];
        // 使用 小区名称 所在区域 作为 key 查找经纬度
        const locationKey = `${parsedItem.小区名称}  ${parsedItem.所在区域}`;
        if (areaCoordinatesMap.has(locationKey)) {
          parsedItem.location = areaCoordinatesMap.get(locationKey);
        } else {
          console.warn(`找不到区域 ${locationKey} 的经纬度`);
        }
      }
    }

    const priceMatch = item['单价'] ? item['单价'].replace(',', '').match(/([\d\.]+)元\/平/) : null;
    if (priceMatch) {
      parsedItem.单价 = parseFloat(priceMatch[1]);
    }

    const followTimeParts = item['关注人数和发布时间'] ? item['关注人数和发布时间'].split(' / ').map((part: string) => part.trim()) : [];
    if (followTimeParts.length > 0) {
      const followMatch = followTimeParts[0].match(/(\d+)人关注/);
      if (followMatch) {
        parsedItem.关注人数 = parseInt(followMatch[1], 10);
      }
    }

    parsedData.push(parsedItem);
  });

  return parsedData.filter(item => item.location); // 过滤掉没有经纬度的房源
}

// Define a ref to store the parsed data
const houseData = ref<ParsedHouse[] | null>(null);

// 定义当前模式状态
const currentMode = ref<'2D' | '3D'>('2D');

// 数据加载逻辑 (修改：先加载经纬度，再加载房源数据)
onMounted(async () => {
  await loadAreaCoordinates(); // 先加载经纬度数据
  try {
    const response = await fetch('/house_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawHouseData = await response.json();
    // 解析房源数据时传入经纬度 Map
    houseData.value = parseHouseData(rawHouseData);

    console.log('解析后的数据并存储:', houseData.value);

  } catch (error) {
    console.error('Error loading or processing data:', error);
  }
});

// 显式导出响应式变量 (可能有助于类型检查)
// export { houseData, currentMode };

</script>

<style scoped>
/* 只保留 App.vue 自己的样式 */
div {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}

/* 移除迁移到 TwoDCharts.vue 的样式 */
</style>