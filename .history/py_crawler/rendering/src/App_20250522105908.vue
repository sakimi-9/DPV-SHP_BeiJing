<template>
  <div>
    <h1>二手房数据可视化</h1>

    <!-- 模式切换 UI -->
    <div>
      <button @click="currentMode = '2D'" :disabled="currentMode === '2D'">2D 模式</button>
      <button @click="currentMode = '3D'" :disabled="currentMode === '3D'">3D 模式</button>
    </div>

    <!-- 2D 图表区域 -->
    <div v-if="currentMode === '2D'" class="charts-2d-container">
      <h2>2D 图表</h2>

      <!-- 各区域房源数量统计 和 单价分布直方图 -->
      <div class="chart-row">
        <div class="chart-item">
          <h3>各区域房源数量统计</h3>
          <div ref="areaChartContainer" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="chart-item">
          <h3>单价分布</h3>
          <div ref="priceHistContainer" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

      <!-- 面积分布直方图 和 户型统计 -->
      <div class="chart-row">
        <div class="chart-item">
          <h3>面积分布</h3>
          <div ref="areaHistContainer" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="chart-item">
          <h3>户型统计</h3>
          <div ref="unitTypeChartContainer" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

      <!-- 关注人数与单价散点图 和 关注人数与面积散点图 -->
      <div class="chart-row">
        <div class="chart-item">
          <h3>关注人数与单价关系</h3>
          <div ref="followPriceScatterContainer" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="chart-item">
          <h3>关注人数与面积关系</h3>
          <div ref="followAreaScatterContainer" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
// Import the necessary components and charts
import { BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Import the dataTool module extension
import 'echarts/dist/extension/dataTool';

echarts.use([
  BarChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
  // dataTool is expected to be available on echarts.dataTool after import
]);

// Import Three.js
import * as THREE from 'three';

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

// Three.js related variables
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let cube: THREE.Mesh | null = null;
let animationFrameId: number | null = null; // To store animation frame ID for cleanup

// Function to setup the Three.js scene
const setupThreeJSScene = (container: HTMLElement, parsedData: ParsedHouse[]) => {
  // Cleanup any existing scene first
  cleanupThreeJSScene();

  // 1. Create Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // 3. Create Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 4. Add a simple object (Cube)
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Basic material won't react to light
  // Use a material that reacts to light so we can add lighting later
  const meshMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Phong material reacts to light
  cube = new THREE.Mesh(geometry, meshMaterial);
  scene.add(cube);

  // 5. Add Light (needed for MeshPhongMaterial)
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // 6. Animation Loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    if (renderer && camera && scene) {
      renderer.render(scene, camera);
    }
  };
  animate();

  // Handle window resize
  const handleResize = () => {
    if (camera && renderer && container) {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
  };
  window.addEventListener('resize', handleResize);

  // Store resize handler to remove it later
  (container as any).__resizeHandler = handleResize;

  console.log('Three.js scene setup complete.');
};

// Function to cleanup the Three.js scene
const cleanupThreeJSScene = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  if (renderer) {
    // Remove canvas from DOM
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer.dispose();
    renderer = null;
  }
  if (scene) {
    // Dispose scene objects and geometry/materials if necessary for complex scenes
    scene = null; // Simple cleanup for now
  }
  if (camera) {
    camera = null;
  }
  if (cube) {
    cube = null;
  }
  if (threeContainer.value && (threeContainer.value as any).__resizeHandler) {
    window.removeEventListener('resize', (threeContainer.value as any).__resizeHandler);
    delete (threeContainer.value as any).__resizeHandler;
  }
  console.log('Three.js scene cleanup complete.');
};

// 绘制各区域房源数量统计图 (已有的逻辑，稍作修改)
function renderAreaChart(chartElement: HTMLElement, data: ParsedHouse[]) {
  // if (!areaChartContainer.value) return;

  const areaCounts: { [key: string]: number } = {};
  data.forEach((item: ParsedHouse) => {
    if (item.所在区域) {
      areaCounts[item.所在区域] = (areaCounts[item.所在区域] || 0) + 1;
    }
  });

  const areas = Object.keys(areaCounts);
  const counts = Object.values(areaCounts);

  const myChart = echarts.init(chartElement);
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
  const prices = parsedData
    .map(house => house.单价)
    .filter((price): price is number => price !== null && !isNaN(price)); // Filter out null/NaN values

  if (prices.length === 0) {
    console.warn("No valid price data to draw histogram.");
    // Optional: Clear or hide the chart element
    echarts.dispose(chartElement); // Dispose existing chart instance if any
    chartElement.innerHTML = '<p>暂无单价分布数据</p>'; // Add a message
    return;
  }

  // Manually calculate histogram bins and data
  const numBins = 20; // You can adjust the number of bins
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const binRange = (maxPrice - minPrice) / numBins;

  const bins: { interval: [number, number], count: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({ interval: [minPrice + i * binRange, minPrice + (i + 1) * binRange], count: 0 });
  }

  // Handle the maximum value potentially falling into the last bin
  if (maxPrice > bins[numBins - 1].interval[1]) {
    bins[numBins - 1].interval[1] = maxPrice; // Ensure the last bin includes the max value
  }


  prices.forEach(price => {
    for (let i = 0; i < numBins; i++) {
      // Check if price falls into the current bin interval
      // Use <= for the upper bound of the last bin to include the max value
      if (price >= bins[i].interval[0] && (price < bins[i].interval[1] || (i === numBins - 1 && price <= bins[i].interval[1]))) {
        bins[i].count++;
        break; // Found the bin, move to the next price
      }
    }
  });

  const chart = echarts.init(chartElement);
  const options = {
    title: { text: '单价分布' },
    tooltip: {
      formatter: function (params: any) { // TODO: Add specific type for params
        const bin = bins.find(b => `${b.interval[0].toFixed(2)}-${b.interval[1].toFixed(2)}` === params.name);
        if (bin) {
          return `单价范围: ${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}<br/>房源数量: ${bin.count}`;
        }
        return params.name + '<br/>' + params.seriesName + ': ' + params.value;
      }
    },
    xAxis: {
      type: 'category',
      data: bins.map(bin => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}`), // Format bin labels
      axisLabel: { // Rotate labels if they overlap
        interval: 0,
        rotate: 45,
        overflow: 'breakAll',
        ellipsis: '...'
      }
    },
    yAxis: { type: 'value', name: '房源数量' },
    series: [{
      name: '房源数量',
      data: bins.map(bin => bin.count),
      type: 'bar'
    }]
  };
  chart.setOption(options);
};

// Function to draw the size distribution histogram
const drawSizeDistributionChart = (chartElement: HTMLElement, parsedData: ParsedHouse[]) => {
  const sizes = parsedData
    .map(house => house.面积)
    .filter((size): size is number => size !== null && !isNaN(size)); // Filter out null/NaN values

  if (sizes.length === 0) {
    console.warn("No valid size data to draw histogram.");
    // Optional: Clear or hide the chart element
    echarts.dispose(chartElement); // Dispose existing chart instance if any
    chartElement.innerHTML = '<p>暂无面积分布数据</p>'; // Add a message
    return;
  }

  // Manually calculate histogram bins and data
  const numBins = 20; // You can adjust the number of bins
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const binRange = (maxSize - minSize) / numBins;

  const bins: { interval: [number, number], count: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({ interval: [minSize + i * binRange, minSize + (i + 1) * binRange], count: 0 });
  }

  // Handle the maximum value potentially falling into the last bin
  if (maxSize > bins[numBins - 1].interval[1]) {
    bins[numBins - 1].interval[1] = maxSize; // Ensure the last bin includes the max value
  }


  sizes.forEach(size => {
    for (let i = 0; i < numBins; i++) {
      // Check if size falls into the current bin interval
      // Use <= for the upper bound of the last bin to include the max value
      if (size >= bins[i].interval[0] && (size < bins[i].interval[1] || (i === numBins - 1 && size <= bins[i].interval[1]))) {
        bins[i].count++;
        break; // Found the bin, move to the next size
      }
    }
  });


  const chart = echarts.init(chartElement);
  const options = {
    title: { text: '面积分布' },
    tooltip: {
      formatter: function (params: any) { // TODO: Add specific type for params
        const bin = bins.find(b => `${b.interval[0].toFixed(2)}-${b.interval[1].toFixed(2)}` === params.name);
        if (bin) {
          return `面积范围: ${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}<br/>房源数量: ${bin.count}`;
        }
        return params.name + '<br/>' + params.seriesName + ': ' + params.value;
      }
    },
    xAxis: {
      type: 'category',
      data: bins.map(bin => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}`), // Format bin labels
      axisLabel: { // Rotate labels if they overlap
        interval: 0,
        rotate: 45,
        overflow: 'breakAll',
        ellipsis: '...'
      }
    },
    yAxis: { type: 'value', name: '房源数量' },
    series: [{
      name: '房源数量',
      data: bins.map(bin => bin.count),
      type: 'bar'
    }]
  };
  chart.setOption(options);
};

// 绘制户型统计图 (饼图示例)
function renderUnitTypeChart(chartElement: HTMLElement, data: ParsedHouse[]) {
  // if (!unitTypeChartContainer.value) return;

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

  const myChart = echarts.init(chartElement);
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
function renderFollowPriceScatter(chartElement: HTMLElement, data: ParsedHouse[]) {
  // if (!followPriceScatterContainer.value) return;

  const scatterData = data
    .filter(item => item.关注人数 !== null && item.单价 !== null)
    .map(item => [item.单价, item.关注人数]); // [x: 单价, y: 关注人数]

  const myChart = echarts.init(chartElement);
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
      formatter: function (params: any) { // TODO: Add specific type for params
        const item = params[0];
        // Finding original item might be slow for large datasets; consider other approaches if performance is an issue.
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
function renderFollowAreaScatter(chartElement: HTMLElement, data: ParsedHouse[]) {
  // if (!followAreaScatterContainer.value) return;

  const scatterData = data
    .filter(item => item.关注人数 !== null && item.面积 !== null)
    .map(item => [item.面积, item.关注人数]); // [x: 面积, y: 关注人数]

  const myChart = echarts.init(chartElement);
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
      formatter: function (params: any) { // TODO: Add specific type for params
        const item = params[0];
        // Finding original item might be slow for large datasets; consider other approaches if performance is an issue.
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
  try {
    const response = await fetch('/house_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawHouseData = await response.json();
    const parsedHouseData = parseHouseData(rawHouseData);

    console.log('解析后的数据:', parsedHouseData); // 打印解析后的数据以便检查

    // Initial render based on current mode
    if (currentMode.value === '2D') {
      // Add null checks and type assertions for chart containers
      if (areaChartContainer.value) renderAreaChart(areaChartContainer.value as HTMLElement, parsedHouseData);
      if (priceHistContainer.value) drawUnitPriceDistributionChart(priceHistContainer.value as HTMLElement, parsedHouseData);
      if (areaHistContainer.value) drawSizeDistributionChart(areaHistContainer.value as HTMLElement, parsedHouseData);
      if (unitTypeChartContainer.value) renderUnitTypeChart(unitTypeChartContainer.value as HTMLElement, parsedHouseData);
      if (followPriceScatterContainer.value) renderFollowPriceScatter(followPriceScatterContainer.value as HTMLElement, parsedHouseData);
      if (followAreaScatterContainer.value) renderFollowAreaScatter(followAreaScatterContainer.value as HTMLElement, parsedHouseData);
    } else if (currentMode.value === '3D') {
      if (threeContainer.value) {
        setupThreeJSScene(threeContainer.value as HTMLElement, parsedHouseData);
      }
    }

  } catch (error) {
    console.error('Error loading or processing data:', error);
  }
});

// Watch for mode changes to setup/cleanup scenes
watch(currentMode, (newMode, oldMode) => {
  console.log('Mode switched from', oldMode, 'to', newMode); // Added log
  const parsedHouseData: ParsedHouse[] = []; // TODO: Get actual parsed data here
  // Note: Re-parsing data on every mode switch is inefficient. Consider storing it.

  if (newMode === '3D') {
    cleanupThreeJSScene(); // Ensure old scene is cleaned up
    if (threeContainer.value) {
      // TODO: Pass actual parsed data to setupThreeJSScene
      setupThreeJSScene(threeContainer.value as HTMLElement, parsedHouseData);
    }
  } else if (newMode === '2D') {
    cleanupThreeJSScene(); // Cleanup 3D scene
    // TODO: Redraw 2D charts if necessary (they are currently drawn only onMounted)
    // Redrawing requires access to parsedHouseData
  }
});

onUnmounted(() => {
  cleanupThreeJSScene(); // Cleanup 3D scene when component is unmounted
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

.charts-2d-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Add space between rows */
}

.chart-row {
  display: flex;
  gap: 20px;
  /* Add space between charts in a row */
}

.chart-item {
  flex: 1;
  /* Allow chart item to grow and shrink */
  min-width: 0;
  /* Prevent content from overflowing */
}

/* Adjust chart div width */
.chart-item>div {
  width: 100%;
}
</style>