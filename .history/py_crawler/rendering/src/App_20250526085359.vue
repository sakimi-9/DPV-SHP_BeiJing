<template>
  <div>
    <h1 style="text-align: center;">二手房数据可视化</h1>

    <!-- 模式切换 UI -->


    <!-- 2D 图表区域 -->
    <TwoDCharts v-if="currentMode === '2D'" :house-data="houseData" />

    <!-- 数据分析区域 -->
    <div class="data-analysis-container">
      <h2>数据分析与市场洞察</h2>

      <h3>1. 关注人数与单价关系</h3>
      <p><strong>图表特征：</strong> 横轴为单价（元/平，范围 20,000-80,000），纵轴为关注人数（分档：0, 20-40, 40+）。</p>
      <p><strong>分析发现：</strong></p>
      <ul>
        <li><strong>单价与关注人数呈显著负相关：</strong>
          低价房源（2-4万/平）关注人数（40+）远高于高价房源（6-8万/平），后者关注人数较少（20-40或更低）。这反映了刚需购房者对价格高度敏感，低价区域（如五环外或郊区）更受欢迎。</li>
        <li><strong>市场分化：</strong> 单价 4-6 万/平是过渡区间，关注人数中等，可能对应中产家庭或学区房需求。</li>
      </ul>
      <p><strong>建议：</strong> 优先推广低价房源吸引流量；高价房源需突出其稀缺性和独特优势（如学区、地段、品质）。</p>

      <h3>2. 关注人数与面积关系</h3>
      <p><strong>图表特征：</strong> 横轴为面积（平米，范围 20-100），纵轴为关注人数（分档与单价图一致）。</p>
      <p><strong>分析发现：</strong></p>
      <ul>
        <li><strong>小户型（20-60㎡）关注度最高：</strong> 关注人数集中在 40+，反映市场以刚需（单身、年轻夫妇）和投资客（易出租）为主；60㎡以下通常是"上车盘"。</li>
        <li><strong>大户型（80-100㎡）关注度相对较低：</strong> 关注人数降至 20-40 档，主要面向改善型家庭，需求群体较小。</li>
        <li><strong>异常点提示：</strong> 大面积房源关注人数异常突增时，需探查是否受学区、公园、地铁等特殊配套因素驱动。</li>
      </ul>
      <p><strong>建议：</strong> 优化小户型供应；强调大户型对满足三孩政策、居家办公等需求的适应性。</p>

      <h3>3. 交叉分析（单价 vs 面积）潜在规律</h3>
      <ul>
        <li><strong>低价小户型：</strong> 关注度最高，典型代表是郊区或老破小学区房（如海淀区 30㎡ 学区房），体现了"以小博大"或纯粹刚需的特征。</li>
        <li><strong>高价小户型：</strong> 可能位于核心商圈（如国贸），多为投资或高端单身人士选择，关注人数中等。</li>
        <li><strong>低价大户型：</strong> 市场上较少见，若出现可能分布在远郊区域（如密云），需重点考量其交通便利性及周边配套。</li>
      </ul>

      <h3>4. 北京市场洞察总结</h3>
      <ul>
        <li><strong>刚需主导：</strong> 单价 &lt;4 万/平、面积 &lt;60㎡ 的房源是当前市场流量的核心。</li>
        <li><strong>区域差异显著：</strong>
          <ul>
            <li>高单价但关注度相对较低的房源可能集中在西城、东城等传统高端或学区热门区域。</li>
            <li>高关注度且价格较低的房源可能主要分布在昌平、大兴等城市新兴发展区域。</li>
          </ul>
        </li>
        <li><strong>投资信号明确：</strong> 小户型的高关注度预示着租赁市场活跃，应挖掘和利用"职住平衡"区域的热点（如望京、中关村）进行投资分析。</li>
      </ul>

      <h3>5. 结合新增图表分析</h3>
      <h4>气泡图分析（关注人数 / 单价 / 面积 / 户型）</h4>
      <ul>
        <li>小户型（&lt;60㎡）在较低单价（&lt;4 万/平）时关注度最高，再次印证这类房源深受刚需购房者青睐。</li>
        <li>大户型（&gt;80㎡）在较高单价（&gt;6 万/平）时关注度偏低，表明这部分市场主要由改善型需求构成，但体量相对有限。</li>
      </ul>

      <h4>平行坐标图分析（多维度房源特征）</h4>
      <ul>
        <li>总楼层、朝向、建筑年代等因素与单价存在关联。例如，较新的建筑（房龄 &lt; 5 年）通常单价更高。</li>
        <li>单价较高的房源倾向于位于总楼层较高的建筑单元内，且拥有更佳的朝向（如东南、西南），体现了采光、视野等因素的价值。</li>
      </ul>

      <h4>热力图分析（区域单价密度）</h4>
      <ul>
        <li>图表清晰展示了不同区域在各单价区间的房源分布密集程度。</li>
        <li>临河里、梨园等区域在特定单价区间显示出较高密度，提示这些区域是该价格段房源的主要集中地。</li>
        <li>双井、CBD 等区域的密度分布可能更分散或在更高单价区间显示密度，反映了这些区域房价结构的差异性和分化特征。</li>
      </ul>

      <h3>6. 综合建议</h3>
      <ul>
        <li><strong>低价房源推广：</strong> 持续关注和优先推广低总价、小面积的房源，以最大化吸引刚需和投资客流量。</li>
        <li><strong>高价房源定位：</strong> 精准定位高端改善型客户，重点突出房源在学区、地段、稀缺配套、建筑品质等方面的独特价值。</li>
        <li><strong>优化供应结构：</strong> 根据市场需求趋势，引导开发商和中介在特定区域增加受欢迎的小户型供应，并设计更能满足改善需求的、功能性更强的多居室房型。</li>
        <li><strong>区域差异化策略：</strong> 针对不同区域的市场特征，制定定制化的营销和销售方案。例如，在新兴区域侧重性价比和配套潜力宣传，在成熟区域强调居住品质和社区环境。</li>
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