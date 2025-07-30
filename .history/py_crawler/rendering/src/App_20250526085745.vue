<template>
  <div>
    <h1 style="text-align: center;">二手房数据可视化</h1>

    <!-- 模式切换 UI -->


    <!-- 2D 图表区域 -->
    <TwoDCharts v-if="currentMode === '2D'" :house-data="houseData" />

    <!-- 数据分析区域 -->
    <div class="data-analysis-container">
      <h2>北京二手房市场数据分析与洞察</h2>

      <h3>1. 基础房源数据分布分析</h3>
      <h4>各区域房源数量统计</h4>
      <p>通过柱状图展示了不同区域的房源挂牌数量，反映了各区域的市场活跃度和房源供给量。</p>
      <h4>每平米价格与房屋面积分布</h4>
      <p>直方图展示了单价（元/平）和房屋面积（平米）的分布情况。有助于了解市场的主流价格区间和房屋面积段，识别价格或面积的集中趋势和异常值。</p>
      <h4>房屋各户型统计</h4>
      <p>饼图或柱状图展示了不同户型的房源比例，反映了市场上主流的户型需求和供给结构（如1室1厅、2室1厅等）。</p>

      <h3>2. 关注度与房源特征关系分析</h3>
      <h4>关注人数与单价/面积关系</h4>
      <ul>
        <li><strong>关注人数与单价呈显著负相关：</strong> 低价房源（尤其是单价在 2-4 万/平区间）通常拥有最高的关注人数（40+），而高价房源（如 6-8 万/平）关注度则显著较低（20-40
          或更低）。这表明刚需购房者对价格的敏感性是市场关注度的主要驱动因素，低价区域或房源是市场流量主力。</li>
        <li><strong>关注人数与面积关系：</strong> 小户型（20-60㎡）同样更受市场关注，关注人数集中在 40+ 档，反映了北京市场对"上车盘"和投资出租房源的需求。大户型（80-100㎡）关注度相对较低。
        </li>
      </ul>
      <h4>关注人数 / 单价 / 面积 / 户型 关系 (气泡图)</h4>
      <ul>
        <li>气泡图整合展示了面积、单价、关注人数和户型四个维度的关系。</li>
        <li>进一步印证，低单价、小面积的小户型房源在关注人数维度上表现为更大的气泡，表明其综合关注度最高。</li>
        <li>高单价、大面积的房源气泡相对较小，对应改善型需求的相对较少。</li>
      </ul>

      <h3>3. 多维度房源特征关联分析</h3>
      <ul>
        <li>平行坐标图直观展示了面积、总楼层、朝向、建筑年份和单价等多个维度之间的复杂关联。</li>
        <li>观察线条的走向可以发现潜在规律：例如，单价较高的房源通常在建筑年份维度上偏新（房龄小），在总楼层上可能倾向于中高楼层，并且朝向（如南北、东南）通常较好。</li>
        <li>该图有助于发现隐藏的模式和影响房源价值的综合因素。</li>
      </ul>

      <h3>4. 区域与价格空间分析</h3>
      <h4>区域单价密度 (热力图)</h4>
      <ul>
        <li>热力图清晰地以颜色的深浅展示了不同区域在不同单价区间的房源数量密度。</li>
        <li>可以直观识别出特定单价段房源在哪些区域最为集中。例如，某些区域可能在 4-6 万/平米区间密度很高，而另一些区域则可能在 8 万/平米以上显示高密度，反映了区域之间的价格梯度和结构差异。</li>
        <li>这有助于理解不同区域的市场定位和价格水平。</li>
      </ul>
      <h4>区域差异总结</h4>
      <ul>
        <li>高单价但关注度相对较低的房源可能集中在城市核心区域或传统高端住宅区。</li>
        <li>高关注度且价格较低的房源可能主要分布在城市的新兴居住区域或交通便利的郊区。</li>
      </ul>

      <h3>5. 北京二手房市场洞察总结与建议</h3>
      <p><strong>市场洞察：</strong></p>
      <ul>
        <li><strong>刚需主导特征：</strong> 当前市场显著由刚需驱动，对价格和总价敏感度高，偏好低单价、小面积的房源。</li>
        <li><strong>投资潜力：</strong> 小户型的高关注度提示租赁市场的活跃和投资机会，尤其是在职住平衡的热点区域。</li>
        <li><strong>区域分化：</strong> 不同区域的市场供需结构、价格水平和目标客群存在明显差异。</li>
        <li><strong>价值驱动因素：</strong> 除基础的价格和面积外，房龄、楼层、朝向以及区域配套（学区、交通、商业）综合影响房源价值和市场关注度。</li>
      </ul>
      <p><strong>综合建议：</strong></p>
      <ul>
        <li><strong>低价房源营销策略：</strong> 持续优先推广低总价、小面积房源，突出性价比和"上车"门槛低的优势，吸引更广泛的刚需和投资客群。</li>
        <li><strong>高价房源营销策略：</strong> 精准锁定高端改善型客户，营销重点放在房源的稀缺性（地段、学区、独特景观）和高品质居住体验上。</li>
        <li><strong>优化房源供给结构：</strong> 市场参与者应根据数据分析，调整房源的开发和推荐策略，增加市场急需的小户型供应，同时为改善型客户提供满足多成员居住、居家办公等功能需求的房型。</li>
        <li><strong>精细化区域运营：</strong> 深入分析不同区域的市场数据和客群特点，制定差异化的运营和推广方案，提高房源匹配效率和交易成功率。</li>
      </ul>
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
/* Add any specific styles for the 3D visualization container if needed */
/* Only retain App.vue's own styles */
div {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}

/* Add styles for the data analysis container */
.data-analysis-container {
  border: 1px solid #ccc;
  /* Add a border */
  padding: 20px;
  /* Add padding inside the box */
  margin-top: 20px;
  /* Add some space above the box */
  background-color: #f9f9f9;
  /* Add a light background color */
  border-radius: 8px;
  /* Rounded corners */
}

.data-analysis-container h2,
.data-analysis-container h3 {
  text-align: center;
  /* Center the titles within the box */
  color: #333;
  /* Darker color for titles */
  margin-bottom: 15px;
  /* Add space below titles */
}

.data-analysis-container h4 {
  margin-top: 15px;
  /* Space above h4 */
  margin-bottom: 10px;
  /* Space below h4 */
  color: #555;
  /* Slightly lighter color for h4 */
}

.data-analysis-container p {
  line-height: 1.6;
  /* Improve readability with more line spacing */
  color: #555;
  /* Slightly lighter color for text */
  margin-bottom: 10px;
  /* Adjust space between paragraphs */
}

.data-analysis-container ul {
  margin-bottom: 15px;
  /* Space below lists */
  padding-left: 20px;
  /* Indent list items */
}

.data-analysis-container ul li {
  margin-bottom: 5px;
  /* Space between list items */
  line-height: 1.5;
  /* Line spacing for list items */
  color: #555;
}


.data-analysis-container p strong {
  color: #000;
  /* Make strong text black */
}

/* Remove styles migrated to TwoDCharts.vue */
/* Keep only App.vue specific styles */

/* Example styles for layout if needed, adjust based on your structure */
/*
.container {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px;
}
*/
</style>