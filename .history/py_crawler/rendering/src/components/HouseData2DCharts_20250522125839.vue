<template>
    <div class="charts-2d-container">
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

import { ParsedHouse } from '../utils/dataParser'; // Import ParsedHouse interface

// Define component props to receive house data
const props = defineProps<{ data: ParsedHouse[] | null }>();

// Define refs for chart containers
const areaChartContainer = ref<HTMLElement | null>(null);
const priceHistContainer = ref<HTMLElement | null>(null);
const areaHistContainer = ref<HTMLElement | null>(null);
const unitTypeChartContainer = ref<HTMLElement | null>(null);
const followPriceScatterContainer = ref<HTMLElement | null>(null);
const followAreaScatterContainer = ref<HTMLElement | null>(null);

// Chart instances to be disposed on cleanup
let areaChartInstance: echarts.ECharts | null = null;
let priceHistChartInstance: echarts.ECharts | null = null;
let areaHistChartInstance: echarts.ECharts | null = null;
let unitTypeChartInstance: echarts.ECharts | null = null;
let followPriceScatterInstance: echarts.ECharts | null = null;
let followAreaScatterInstance: echarts.ECharts | null = null;

// --- 2D Chart Drawing Functions (Copied from App.vue) ---

// 绘制各区域房源数量统计图
function renderAreaChart(chartElement: HTMLElement, data: ParsedHouse[]) {
    if (!data || data.length === 0) {
        console.warn("No data for Area Chart.");
        return;
    }
    areaChartInstance = echarts.init(chartElement);
    const areaCounts: { [key: string]: number } = {};
    data.forEach((item: ParsedHouse) => {
        if (item.所在区域) {
            areaCounts[item.所在区域] = (areaCounts[item.所在区域] || 0) + 1;
        }
    });

    const areas = Object.keys(areaCounts);
    const counts = Object.values(areaCounts);

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
    areaChartInstance.setOption(option);
}

// Function to draw the unit price distribution histogram (Manual calculation)
const drawUnitPriceDistributionChart = (chartElement: HTMLElement, parsedData: ParsensedHouse[]) => {
    const prices = parsedData
        .map(house => house.单价)
        .filter((price): price is number => price !== null && !isNaN(price)); // Filter out null/NaN values

    if (prices.length === 0) {
        console.warn("No valid price data to draw histogram.");
        // Optional: Clear or hide the chart element
        // echarts.dispose(chartElement); // Dispose existing chart instance if any
        chartElement.innerHTML = '<p>暂无单价分布数据</p>'; // Add a message
        priceHistChartInstance = null; // Clear instance reference
        return;
    }
    priceHistChartInstance = echarts.init(chartElement);

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

    const options = {
        title: { text: '单价分布' },
        tooltip: {
            formatter: function (params: any) { // TODO: Add specific type for params
                const bin = bins.find(b => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}` === params.name);
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
    priceHistChartInstance.setOption(options);
};

// Function to draw the size distribution histogram (Manual calculation)
const drawSizeDistributionChart = (chartElement: HTMLElement, parsedData: ParsedHouse[]) => {
    const sizes = parsedData
        .map(house => house.面积)
        .filter((size): size is number => size !== null && !isNaN(size)); // Filter out null/NaN values

    if (sizes.length === 0) {
        console.warn("No valid size data to draw histogram.");
        // echarts.dispose(chartElement); // Dispose existing chart instance if any
        chartElement.innerHTML = '<p>暂无面积分布数据</p>'; // Add a message
        areaHistChartInstance = null; // Clear instance reference
        return;
    }
    areaHistChartInstance = echarts.init(chartElement);

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

    const options = {
        title: { text: '面积分布' },
        tooltip: {
            formatter: function (params: any) { // TODO: Add specific type for params
                const bin = bins.find(b => `${bin.interval[0].toFixed(2)}-${bin.interval[1].toFixed(2)}` === params.name);
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
    areaHistChartInstance.setOption(options);
};

// 绘制户型统计图 (饼图示例)
function renderUnitTypeChart(chartElement: HTMLElement, data: ParsedHouse[]) {
    if (!data || data.length === 0) {
        console.warn("No data for Unit Type Chart.");
        return;
    }
    unitTypeChartInstance = echarts.init(chartElement);

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
                ...
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
    unitTypeChartInstance.setOption(option);
}

// 绘制关注人数与单价散点图
function renderFollowPriceScatter(chartElement: HTMLElement, data: ParsedHouse[]) {
    if (!data || data.length === 0) {
        console.warn("No data for Follow Price Scatter.");
        return;
    }
    followPriceScatterInstance = echarts.init(chartElement);

    const scatterData = data
        .filter(item => item.关注人数 !== null && item.单价 !== null)
        .map(item => [item.单价, item.关注人数]); // [x: 单价, y: 关注人数]


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
    followPriceScatterInstance.setOption(option);
}

// 绘制关注人数与面积散点图
function renderFollowAreaScatter(chartElement: HTMLElement, data: ParsedHouse[]) {
    if (!data || data.length === 0) {
        console.warn("No data for Follow Area Scatter.");
        return;
    }
    followAreaScatterInstance = echarts.init(chartElement);

    const scatterData = data
        .filter(item => item.关注人数 !== null && item.面积 !== null)
        .map(item => [item.面积, item.关注人数]); // [x: 面积, y: 关注人数]

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
    followAreaScatterInstance.setOption(option);
}

// Function to dispose all chart instances
const disposeCharts = () => {
    if (areaChartInstance) areaChartInstance.dispose();
    if (priceHistChartInstance) priceHistChartInstance.dispose();
    if (areaHistChartInstance) areaHistChartInstance.dispose();
    if (unitTypeChartInstance) unitTypeChartInstance.dispose();
    if (followPriceScatterInstance) followPriceScatterInstance.dispose();
    if (followAreaScatterInstance) followAreaScatterInstance.dispose();
    console.log('All 2D charts disposed.');
}

// Watch for data changes and draw charts
watch(() => props.data, (newData) => {
    if (newData) {
        // Dispose existing charts before drawing new ones
        disposeCharts();
        // Need nextTick to ensure DOM elements are ready, although watch on props might imply they are.
        // Adding it for robustness.
        nextTick(() => {
            if (areaChartContainer.value) renderAreaChart(areaChartContainer.value as HTMLElement, newData);
            if (priceHistContainer.value) drawUnitPriceDistributionChart(priceHistContainer.value as HTMLElement, newData);
            if (areaHistContainer.value) drawSizeDistributionChart(areaHistContainer.value as HTMLElement, newData);
            if (unitTypeChartContainer.value) renderUnitTypeChart(unitTypeChartContainer.value as HTMLElement, newData);
            if (followPriceScatterContainer.value) renderFollowPriceScatter(followPriceScatterContainer.value as HTMLElement, newData);
            if (followAreaScatterContainer.value) renderFollowAreaScatter(followAreaScatterContainer.value as HTMLElement, newData);
            console.log('2D charts redrawn with new data.');
        });
    } else {
        // If data becomes null, dispose charts
        disposeCharts();
        // Optional: Display a message indicating no data
        // if(areaChartContainer.value) areaChartContainer.value.innerHTML = '<p>暂无数据</p>';
        // ... repeat for other containers
    }
}, { immediate: true }); // Immediate: true to run the watcher immediately on mount if data is already available


// Dispose charts on component unmount
onUnmounted(() => {
    disposeCharts();
});

</script>

<style scoped>
/* 组件样式 */
div {
    margin-bottom: 20px;
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
    flex-wrap: wrap;
    /* Allow wrapping on smaller screens */
}

.chart-item {
    flex: 1;
    /* Allow chart item to grow and shrink */
    min-width: 350px;
    /* Minimum width to prevent excessive squeezing */
    /* width: 48%; Remove fixed width to let flex handle it */
}

/* Adjust chart div width */
.chart-item>div {
    width: 100%;
    height: 400px;
    /* Ensure a default height */
}

/* Added styles for better layout */
.charts-2d-container>h2 {
    width: 100%;
    /* Ensure the heading takes full width */
}
</style>