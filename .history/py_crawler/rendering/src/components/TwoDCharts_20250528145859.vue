<template>
    <div class="charts-2d-container">

        <!-- Chart Carousel -->
        <div class="chart-carousel">
            <button @click="prevChart" :disabled="currentIndex === 0" class="nav-button left-arrow">
                <svg t="1748415020699" class="icon" viewBox="0 0 1127 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1480" width="50" height="50">
                    <path
                        d="M512.7 34.8c64.5 0 127.1 12.6 186.10000001 37.6 56.9 24.1 108 58.5 151.89999999 102.4 43.9 43.9 78.4 95 102.40000001 151.9 24.9 59 37.6 121.6 37.59999999 186.1s-12.6 127.1-37.59999999 186.1c-24.1 56.9-58.5 108-102.40000001 151.9-43.9 43.9-95 78.4-151.89999999 102.4-58.9 24.9-121.6 37.6-186.10000001 37.6s-127.1-12.6-186.1-37.6c-56.9-24.1-108-58.5-151.9-102.4-43.9-43.9-78.4-95-102.4-151.9-24.9-58.9-37.6-121.6-37.60000001-186.1s12.6-127.1 37.60000001-186.1c24.1-56.9 58.5-108 102.4-151.9s95-78.4 151.9-102.4c58.9-25 121.6-37.6 186.1-37.6z m0 896c56.4 0 111.2-11 162.7-32.8 49.8-21.1 94.5-51.2 132.9-89.6s68.5-83.1 89.6-132.90000001C919.6 624 930.7 569.2 930.7 512.8s-11-111.2-32.8-162.69999999c-21.1-49.8-51.2-94.5-89.6-132.90000001-38.4-38.4-83.1-68.5-132.9-89.6-51.5-21.8-106.3-32.8-162.7-32.8s-111.2 11-162.7 32.8c-49.8 21.1-94.5 51.2-132.9 89.6-38.4 38.4-68.5 83.1-89.6 132.9-21.8 51.5-32.8 106.3-32.79999999 162.7s11 111.2 32.79999999 162.7c21.1 49.8 51.2 94.5 89.6 132.9 38.4 38.4 83.1 68.5 132.9 89.6 51.5 21.7 106.2 32.8 162.7 32.8z"
                        fill="#1296db" p-id="1481"></path>
                    <path
                        d="M531.9 308.8c6.5 0 13.09999999 2.1 18.60000001 6.5 13 10.3 15.2 29.1 4.89999999 42.1l-132.2 167.4 131.9 161c10.5 12.8 8.6 31.7-4.2 42.2-12.8 10.5-31.7 8.6-42.2-4.2l-147.19999999-179.6c-8.9-10.9-9.1-26.5-0.30000001-37.6L508.3 320.2c5.9-7.5 14.7-11.4 23.6-11.4z"
                        fill="#1296db" p-id="1482"></path>
                </svg>
            </button>
            <div class="chart-item-single">
                <h3>{{ currentChart.title }}</h3>
                <div :ref="currentChart.ref" style="width: 100%; height: 500px;"></div>
            </div>
            <button @click="nextChart" :disabled="currentIndex === charts.length - 1" class="nav-button right-arrow">
                <svg t="1748415075828" class="icon" viewBox="0 0 1127 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1973" width="50" height="50">
                    <path
                        d="M511.3 989.2c-64.5 0-127.1-12.6-186.1-37.6-56.9-24.1-108-58.5-151.9-102.4-43.9-43.9-78.4-95-102.4-151.9-24.9-59-37.6-121.6-37.6-186.1s12.6-127.1 37.6-186.1c24.1-56.9 58.5-108 102.4-151.9 43.9-43.9 95-78.4 151.9-102.4 58.9-24.9 121.6-37.6 186.1-37.6s127.1 12.6 186.1 37.6c56.9 24.1 108 58.5 151.9 102.4 43.9 43.9 78.4 95 102.4 151.9 24.9 58.9 37.6 121.6 37.6 186.1s-12.6 127.1-37.6 186.1c-24.1 56.9-58.5 108-102.4 151.9s-95 78.4-151.9 102.4c-58.9 25-121.6 37.6-186.1 37.6z m0-896c-56.4 0-111.2 11-162.7 32.8-49.8 21.1-94.5 51.2-132.9 89.6s-68.5 83.1-89.6 132.9C104.4 400 93.3 454.8 93.3 511.2s11 111.2 32.8 162.7c21.1 49.8 51.2 94.5 89.6 132.9 38.4 38.4 83.1 68.5 132.9 89.6 51.5 21.8 106.3 32.8 162.7 32.8s111.2-11 162.7-32.8c49.8-21.1 94.5-51.2 132.9-89.6 38.4-38.4 68.5-83.1 89.6-132.9 21.8-51.5 32.8-106.3 32.8-162.7s-11-111.2-32.8-162.7c-21.1-49.8-51.2-94.5-89.6-132.9-38.4-38.4-83.1-68.5-132.9-89.6-51.5-21.7-106.2-32.8-162.7-32.8z"
                        fill="#4A90E2" p-id="1974"></path>
                    <path
                        d="M492.1 715.2c-6.5 0-13.1-2.1-18.6-6.5-13-10.3-15.2-29.1-4.9-42.1l132.2-167.4-131.9-161c-10.5-12.8-8.6-31.7 4.2-42.2 12.8-10.5 31.7-8.6 42.2 4.2l147.2 179.6c8.9 10.9 9.1 26.5 0.3 37.6L515.7 703.8c-5.9 7.5-14.7 11.4-23.6 11.4z"
                        fill="#4A90E2" p-id="1975"></path>
                </svg>
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import * as echarts from 'echarts/core';
// Import the necessary components and charts
import { BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// Import newly required charts and components
import { ParallelChart, HeatmapChart } from 'echarts/charts';
import { ParallelComponent, VisualMapComponent, CalendarComponent } from 'echarts/components';

echarts.use([
    BarChart,
    PieChart,
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
    ParallelChart,
    HeatmapChart,
    ParallelComponent,
    VisualMapComponent,
    CalendarComponent
]);

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

// 定义接收的 props
const props = defineProps<{ houseData: ParsedHouse[] | null }>();

// 定义图表容器的引用
const areaChartContainer = ref<HTMLElement | null>(null);
const priceHistContainer = ref<HTMLElement | null>(null);
const areaHistContainer = ref<HTMLElement | null>(null);
const unitTypeChartContainer = ref<HTMLElement | null>(null);
const followPriceScatterContainer = ref<HTMLElement | null>(null);
const followAreaScatterContainer = ref<HTMLElement | null>(null);
// New chart container refs
const bubbleChartContainer = ref<HTMLElement | null>(null);
const parallelChartContainer = ref<HTMLElement | null>(null);
const ageFacetScatterContainer = ref<HTMLElement | null>(null);
const areaPriceHeatmapContainer = ref<HTMLElement | null>(null);

// Define the current chart index
const currentIndex = ref(0);

// Computed property for the current chart
const currentChart = computed(() => charts[currentIndex.value]);

// Navigation functions
const nextChart = () => {
    if (currentIndex.value < charts.length - 1) {
        currentIndex.value++;
    }
};

const prevChart = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
};

// Function to dispose of a chart instance
const disposeChart = (chartElement: HTMLElement) => {
    const chartInstance = echarts.getInstanceByDom(chartElement);
    if (chartInstance) {
        chartInstance.dispose();
    }
};

// Function to render the current chart
const renderCurrentChart = (data: ParsedHouse[] | null) => {
    if (!data || data.length === 0) {
        console.warn("No data to render charts.");
        return;
    }

    const chartElement = currentChart.value.ref.value;
    if (chartElement) {
        // Dispose of the previous chart instance before rendering the new one
        disposeChart(chartElement);
        // Render the current chart
        currentChart.value.render(chartElement, data);
    }
};

// Watch for changes in the houseData prop or currentIndex and redraw the current chart
watch([() => props.houseData, currentIndex], async ([newData, newIndex], [oldData, oldIndex]) => {
    // Wait for the DOM to update after currentIndex changes
    await nextTick();
    renderCurrentChart(newData);
}, { immediate: true }); // Use immediate: true to draw charts on initial data load

// --- Chart Render Functions --- //

// 绘制各区域房源数量统计图
function renderAreaChart(chartElement: HTMLElement, data: ParsedHouse[]) {
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
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无单价分布数据</p>';
        return;
    }

    const numBins = 20;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binRange = (maxPrice - minPrice) / numBins;

    const bins: { interval: [number, number], count: number }[] = [];
    for (let i = 0; i < numBins; i++) {
        bins.push({ interval: [minPrice + i * binRange, minPrice + (i + 1) * binRange], count: 0 });
    }

    if (maxPrice > bins[numBins - 1].interval[1]) {
        bins[numBins - 1].interval[1] = maxPrice;
    }


    prices.forEach(price => {
        for (let i = 0; i < numBins; i++) {
            if (price >= bins[i].interval[0] && (price < bins[i].interval[1] || (i === numBins - 1 && price <= bins[i].interval[1]))) {
                bins[i].count++;
                break;
            }
        }
    });

    const chart = echarts.init(chartElement);
    const options = {
        title: {
            text: '单价分布',
            left: 'center'
        },
        tooltip: {
            formatter: function (params: any) {
                const bin = bins.find(b => `${b.interval[0].toFixed(2)}-${b.interval[1].toFixed(2)}` === params.name);
                if (bin) {
                    return `单价范围: ${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}<br/>房源数量: ${bin.count}`;
                }
                return params.name + '<br/>' + params.seriesName + ': ' + params.value;
            }
        },
        xAxis: {
            type: 'category',
            data: bins.map(bin => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}`),
            axisLabel: {
                interval: 0,
                rotate: 45,
                overflow: 'breakAll',
                ellipsis: '...',
                formatter: function (value: string) {
                    const [min, max] = value.split('-').map(parseFloat);
                    if (!isNaN(min) && !isNaN(max)) {
                        return `${(min / 10000).toFixed(2)}-${(max / 10000).toFixed(2)} 万`;
                    }
                    return value;
                }
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
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无面积分布数据</p>';
        return;
    }

    const numBins = 20;
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const binRange = (maxSize - minSize) / numBins;

    const bins: { interval: [number, number], count: number }[] = [];
    for (let i = 0; i < numBins; i++) {
        bins.push({ interval: [minSize + i * binRange, minSize + (i + 1) * binRange], count: 0 });
    }

    if (maxSize > bins[numBins - 1].interval[1]) {
        bins[numBins - 1].interval[1] = maxSize;
    }


    sizes.forEach(size => {
        for (let i = 0; i < numBins; i++) {
            if (size >= bins[i].interval[0] && (size < bins[i].interval[1] || (i === numBins - 1 && size <= bins[i].interval[1]))) {
                bins[i].count++;
                break;
            }
        }
    });


    const chart = echarts.init(chartElement);
    const options = {
        title: {
            text: '面积分布',
            left: 'center'
        },
        tooltip: {
            formatter: function (params: any) {
                const bin = bins.find(b => `${b.interval[0].toFixed(2)}-${b.interval[1].toFixed(2)}` === params.name);
                if (bin) {
                    return `面积范围: ${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}<br/>房源数量: ${bin.count}`;
                }
                return params.name + '<br/>' + params.seriesName + ': ' + params.value;
            }
        },
        xAxis: {
            type: 'category',
            data: bins.map(bin => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}`),
            axisLabel: {
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

// 绘制户型统计图
function renderUnitTypeChart(chartElement: HTMLElement, data: ParsedHouse[]) {
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
function renderFollowAreaScatter(chartElement: HTMLElement, data: ParsedHouse[]) {
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

// Function to draw Bubble Chart (关注人数/单价/面积/户型关系)
function renderBubbleChart(chartElement: HTMLElement, data: ParsedHouse[]) {
    const bubbleData = data
        .filter(item => item.关注人数 !== null && item.单价 !== null && item.面积 !== null && item.室 !== null && item.厅 !== null)
        .map(item => ({
            value: [item.面积, item.单价, item.关注人数], // [x: 面积, y: 单价, size: 关注人数]
            // We can use the item.室 and item.厅 to differentiate series or use visual mapping/labels
            // For simplicity, let's use a simple representation for now.
            // A more complex implementation would involve creating series per unit type.
            // Let's just add house title for tooltip
            houseInfo: `${item.室}室${item.厅}厅 - ${item.房源标题}`
        }));

    if (bubbleData.length === 0) {
        console.warn("No valid data for bubble chart.");
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无气泡图数据</p>';
        return;
    }


    const myChart = echarts.init(chartElement);
    const option = {
        title: {
            text: '关注人数/单价/面积/户型关系',
            left: 'center'
        },
        tooltip: {
            formatter: function (params: any) {
                const item = params.data;
                if (item && item.houseInfo) {
                    return `${item.houseInfo}<br/>面积: ${item.value[0]} 平米<br/>单价: ${item.value[1]} 元/平<br/>关注人数: ${item.value[2]} 人`;
                }
                return `面积: ${item.value[0]} 平米<br/>单价: ${item.value[1]} 元/平<br/>关注人数: ${item.value[2]} 人`;
            }
        },
        xAxis: {
            type: 'value',
            name: '面积 (平米)'
        },
        yAxis: {
            type: 'value',
            name: '单价 (元/平)'
        },
        visualMap: [{ // Map关注人数 to bubble size
            min: 0,
            max: Math.max(...bubbleData.map(item => item.value[2] as number)), // Cast to number
            dimension: 2, // Map to the third dimension (关注人数)
            orient: 'vertical',
            right: '10',
            top: 'center',
            text: ['高关注', '低关注'],
            inRange: {
                symbolSize: [10, 50] // Bubble size range
            }
        }],
        series: [{
            name: '房源',
            type: 'scatter',
            data: bubbleData,
            label: { // Optional: show unit type as label
                show: false, // Set to true to show labels
                formatter: function (params: any) {
                    const item = params.data;
                    if (item && item.houseInfo) {
                        const parts = item.houseInfo.split(' - ');
                        return parts[0]; // Show unit type
                    }
                    return '';
                }
            },
            emphasis: {
                focus: 'series',
                label: {
                    show: true,
                    position: 'top'
                }
            }
        }]
    };
    myChart.setOption(option);
}

// Function to draw Parallel Chart (多维度房源特征关系)
function renderParallelChart(chartElement: HTMLElement, data: ParsedHouse[]) {
    // Filter out data with null values for the dimensions we use
    const parallelData = data.filter(item =>
        item.面积 !== null &&
        item.总楼层 !== null && // Using 总楼层 as a numerical representation of floor
        item.朝向 !== null &&
        item.建筑年份 !== null &&
        item.单价 !== null
    ).map(item => [item.面积, item.总楼层, item.朝向, item.建筑年份, item.单价]); // Order of dimensions matters

    if (parallelData.length === 0) {
        console.warn("No valid data for parallel chart.");
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无平行坐标图数据</p>';
        return;
    }

    const uniqueOrientations = Array.from(new Set(parallelData.map(item => item[2] as string)));


    const myChart = echarts.init(chartElement);
    const option = {
        title: {
            text: '多维度房源特征关系',
            left: 'center'
        },
        parallelAxis: [
            { dim: 0, name: '面积 (平米)', type: 'value' },
            { dim: 1, name: '总楼层', type: 'value' },
            { dim: 2, name: '朝向', type: 'category', data: uniqueOrientations }, // 朝向 is categorical
            { dim: 3, name: '建筑年份', type: 'value' },
            { dim: 4, name: '单价 (元/平)', type: 'value' }
        ],
        series: {
            name: '房源特征',
            type: 'parallel',
            lineStyle: {
                width: 1
            },
            data: parallelData
        },
        tooltip: {
            formatter: function (params: any) {
                const value = params.value;
                const dimensions = ['面积', '总楼层', '朝向', '建筑年份', '单价'];
                let tooltipString = '房源特征:<br/>';
                dimensions.forEach((dim, index) => {
                    tooltipString += `${dim}: ${value[index]}<br/>`;
                });
                return tooltipString;
            }
        },
        parallel: { // positioning of the parallel coordinates
            left: '5%',
            right: '13%',
            bottom: '10%',
            top: '20%'
        },
        visualMap: { // Optional: map 单价 to color
            min: Math.min(...parallelData.map(item => item[4] as number)), // Cast to number
            max: Math.max(...parallelData.map(item => item[4] as number)), // Cast to number
            dimension: 4, // Map to the 5th dimension (单价)
            orient: 'vertical',
            right: '10',
            top: 'center',
            text: ['高单价', '低单价'],
            inRange: {
                color: ['#d94e5d', '#eac736', '#5a90a2'].reverse() // Color gradient
            }
        }
    };
    myChart.setOption(option);
}

// Function to draw Area-Price Facet Scatter Chart (按房龄分面)
function renderAgeFacetScatterChart(chartElement: HTMLElement, data: ParsedHouse[]) {
    const validData = data.filter(item => item.面积 !== null && item.单价 !== null && item.建筑年份 !== null);

    if (validData.length === 0) {
        console.warn("No valid data for age facet scatter chart.");
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无面积-单价分面图数据</p>';
        return;
    }


    // Define age categories
    const currentYear = new Date().getFullYear();
    const ageCategories = [
        { name: '5年内', filter: (year: number) => currentYear - year <= 5 },
        { name: '5-10年', filter: (year: number) => currentYear - year > 5 && currentYear - year <= 10 },
        { name: '10年以上', filter: (year: number) => currentYear - year > 10 }
    ];

    const series = ageCategories.map(category => {
        const categoryData = validData
            .filter(item => item.建筑年份 !== null && category.filter(item.建筑年份))
            .map(item => [item.面积, item.单价]); // [x: 面积, y: 单价]

        return {
            name: category.name,
            type: 'scatter',
            data: categoryData,
            tooltip: {
                formatter: function (params: any) {
                    const item = params.value;
                    // Find the original item to get more info (like house title) - this can be slow for large data
                    const originalItem = validData.find(d => d.面积 === item[0] && d.单价 === item[1] && (currentYear - (d.建筑年份 || 0)) <= (category.name === '5年内' ? 5 : (category.name === '5-10年' ? 10 : Infinity)) && (currentYear - (d.建筑年份 || 0)) > (category.name === '5年内' ? 0 : (category.name === '5-10年' ? 5 : 10)));

                    if (originalItem) {
                        return `房源: ${originalItem.房源标题}<br/>面积: ${item[0]} 平米<br/>单价: ${item[1]} 元/平<br/>房龄: ${currentYear - (originalItem.建筑年份 || 0)} 年`;
                    } else {
                        return `面积: ${item[0]} 平米<br/>单价: ${item[1]} 元/平`;
                    }
                }
            }
        };
    }).filter(s => s.data.length > 0); // Only include series with data


    if (series.length === 0) {
        console.warn("No data available for any age category for facet scatter chart.");
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无面积-单价分面图数据</p>';
        return;
    }


    const myChart = echarts.init(chartElement);
    const option = {
        title: {
            text: '面积-单价关系',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: series.map(s => s.name),
            bottom: '0'
        },
        xAxis: {
            type: 'value',
            name: '面积 (平米)'
        },
        yAxis: {
            type: 'value',
            name: '单价 (元/平)'
        },
        series: series
    };
    myChart.setOption(option);
}

// Function to draw Area Price Heatmap (区域单价密度)
function renderAreaPriceHeatmap(chartElement: HTMLElement, data: ParsedHouse[]) {
    const validData = data.filter(item => item.所在区域 !== null && item.单价 !== null);

    if (validData.length === 0) {
        console.warn("No valid data for area price heatmap.");
        echarts.dispose(chartElement);
        chartElement.innerHTML = '<p>暂无区域单价密度热力图数据</p>';
        return;
    }

    const areaPriceBins: { [area: string]: { [priceBin: string]: number } } = {};
    const priceBins = [0, 20000, 40000, 60000, 80000, 100000, 150000, 200000, Infinity]; // Example price bins
    const priceBinLabels = priceBins.slice(0, -1).map((bin, index) => {
        if (priceBins[index + 1] === Infinity) {
            return `${bin}+`;
        }
        return `${bin}-${priceBins[index + 1]}`;
    });


    validData.forEach(item => {
        const area = item.所在区域 as string;
        const price = item.单价 as number;

        if (!areaPriceBins[area]) {
            areaPriceBins[area] = {};
            priceBinLabels.forEach(label => areaPriceBins[area][label] = 0);
        }

        for (let i = 0; i < priceBins.length - 1; i++) {
            if (price >= priceBins[i] && (price < priceBins[i + 1] || priceBins[i + 1] === Infinity)) {
                areaPriceBins[area][priceBinLabels[i]]++;
                break;
            }
        }
    });

    const heatmapData: [string, string, number][] = []; // [area, priceBin, count]
    const areas = Object.keys(areaPriceBins);
    areas.forEach(area => {
        priceBinLabels.forEach(priceBinLabel => {
            heatmapData.push([area, priceBinLabel, areaPriceBins[area][priceBinLabel] || 0]);
        });
    });


    const myChart = echarts.init(chartElement);
    const option = {
        title: {
            text: '区域单价密度',
            left: 'center'
        },
        tooltip: {
            formatter: function (params: any) {
                const data = params.data;
                return `区域: ${data[0]}<br/>单价范围: ${data[1]} 元/平<br/>房源数量: ${data[2]}`;
            }
        },
        grid: { // Add grid configuration
            right: '15%', // Leave space on the right for visualMap
            left: '10%', // Adjust left margin if needed
            bottom: '20%', // Adjust bottom margin for rotated labels
            top: '15%' // Adjust top margin if needed
        },
        xAxis: {
            type: 'category',
            data: areas,
            axisLabel: { // Rotate labels if needed
                interval: 0,
                rotate: 45,
                overflow: 'breakAll',
                ellipsis: '...'
            },
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: priceBinLabels,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: 0,
            max: Math.max(...heatmapData.map(item => item[2] as number)), // Max count
            calculable: true,
            orient: 'vertical', // Change to vertical
            right: '5%', // Position relative to chart container, within the space created by grid.right
            top: 'center', // Center vertically
            inRange: {
                color: ['#ffffff', '#006edd'] // Color gradient from white to blue
            }
        },
        series: [{
            name: '房源数量',
            type: 'heatmap',
            data: heatmapData,
            label: {
                show: true
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    myChart.setOption(option);
}

// Define the list of charts with their refs, titles, and render functions
const charts = [
    { title: '各区域房源数量统计', ref: areaChartContainer, render: renderAreaChart },
    { title: '每平米价格分布', ref: priceHistContainer, render: drawUnitPriceDistributionChart },
    { title: '房屋面积大小分布', ref: areaHistContainer, render: drawSizeDistributionChart },
    { title: '房屋各户型统计', ref: unitTypeChartContainer, render: renderUnitTypeChart },
    { title: '关注人数与单价关系', ref: followPriceScatterContainer, render: renderFollowPriceScatter },
    { title: '关注人数与面积关系', ref: followAreaScatterContainer, render: renderFollowAreaScatter },
    { title: '关注人数/单价/面积/户型关系 (气泡图)', ref: bubbleChartContainer, render: renderBubbleChart },
    { title: '多维度房源特征关系 (平行坐标图)', ref: parallelChartContainer, render: renderParallelChart },
    { title: '面积-单价关系 (按房龄分面)', ref: ageFacetScatterContainer, render: renderAgeFacetScatterChart },
    { title: '区域单价密度 (热力图)', ref: areaPriceHeatmapContainer, render: renderAreaPriceHeatmap },
];
</script>

<style scoped>
.charts-2d-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    margin-top: 20vh;
}

.chart-carousel {
    position: relative;
    width: 95%;
    max-width: 1400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: auto;
    height: auto;
    border-radius: 0;
    background-color: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 10;
    padding: 0;
    margin: 0 30px;
}

.nav-button svg {
    width: 50px;
    height: 50px;
}

.left-arrow {
    left: -80px;
}

.right-arrow {
    right: -80px;
}

.nav-button:disabled {}

.nav-button:disabled svg path {
    fill: #ccc;
}

.chart-item-single {
    flex-grow: 1;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 20px;
}

.chart-item-single>div {
    width: 100%;
    height: 550px;
}

.chart-row {
    display: none;
}

.chart-item {
    display: none;
}
</style>