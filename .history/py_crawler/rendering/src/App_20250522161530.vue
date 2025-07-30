<template>
  <div>
    <h1 style="text-align: center;">二手房数据可视化</h1>

    <!-- 模式切换 UI -->


    <!-- 2D 图表区域 -->
    <TwoDCharts v-if="currentMode === '2D'" :house-data="houseData" />

    <!-- 数据分析区域 -->
    <div class="data-analysis-container">
      <h2>结合图表的数据分析</h2>
      <h3>1. 关注人数与单价关系</h3>
      <p>
        <strong>图表特征：</strong>
        横轴为单价（元/平），范围从20,000到80,000元/平。
        纵轴为关注人数，分档显示（0、20-40、40+）。
      </p>
      <p>
        <strong>分析发现：</strong>
        <strong>单价与关注人数的负相关：</strong>
        低价房源（20,000-40,000元/平）关注人数显著更高（40+），说明刚需购房者对价格敏感，低价区域（如五环外或郊区）更受关注。
        高价房源（60,000-80,000元/平）关注人数较少（20-40或更低），可能因总价高或目标客群（高端改善型）较小。
        <strong>市场分化：</strong>
        单价40,000-60,000元/平可能是过渡区间，关注人数中等，对应中产家庭或学区房需求。
      </p>
      <p>
        <strong>建议：</strong>
        低价房源可优先推广，吸引流量；高价房源需突出稀缺性（如学区、地段）以提升关注度。
      </p>

      <h3>2. 关注人数与面积关系</h3>
      <p>
        <strong>图表特征：</strong>
        横轴为面积（平米），范围从20到100㎡。
        纵轴为关注人数，分档与单价图表一致。
      </p>
      <p>
        <strong>分析发现：</strong>
        <strong>小户型（20-60㎡）更受关注：</strong>
        关注人数集中在40+，反映北京市场以刚需（单身、年轻夫妇）和投资客（小户型易出租）为主。
        60㎡以下可能对应"上车盘"需求，总价可控。
        <strong>大户型（80-100㎡）关注度下降：</strong>
        关注人数降至20-40档，因总价高且需求群体（改善型家庭）较小。
        <strong>异常点：</strong>
        若某大面积房源关注人数突增（如304人），需检查是否为学区房或特殊配套（如公园、地铁）驱动。
      </p>
      <p>
        <strong>建议：</strong>
        开发商或中介可优化小户型供应，并强调大户型的功能性（如三孩政策、居家办公需求）。
      </p>

      <h3>3. 交叉分析（单价 vs 面积）</h3>
      <p>
        <strong>潜在规律：</strong>
        低价小户型：关注度最高，典型为郊区或老破小学区房（如海淀区30㎡学区房）。
        高价小户型：可能位于核心商圈（如国贸），适合投资；关注人数中等。
        低价大户型：较少见，若存在可能是远郊新房（如密云），需验证交通配套。
      </p>

      <h3>4. 北京市场洞察总结</h3>
      <p>
        <strong>刚需主导：</strong>低价（&lt;40,000元/平）、小面积（&lt;60㎡）房源是市场流量主力。
      </p>
      <p>
        <strong>区域差异：</strong>
        高单价关注度低的房源可能集中在西城、东城等传统豪宅区；
        高关注低价房可能来自昌平、大兴等新兴居住区。
      </p>
      <p>
        <strong>投资信号：</strong>小户型高关注度反映租赁市场需求旺盛，可挖掘"职住平衡"热点（如望京、中关村）。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 导入新组件
import TwoDCharts from './components/TwoDCharts.vue';

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

  return parsedData; // Return all parsed data
}

// Define a ref to store the parsed data
const houseData = ref<ParsedHouse[] | null>(null);

// 定义当前模式状态
const currentMode = ref<'2D'>('2D'); // Only 2D mode is available now

// 数据加载逻辑 (修改：先加载经纬度，再加载房源数据)
onMounted(async () => {
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