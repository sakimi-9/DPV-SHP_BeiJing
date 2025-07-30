<template>
    <div class="charts-2d-container">

        <!-- 各区域房源数量统计 和 单价分布直方图 -->
        <div class="chart-row">
            <div class="chart-item">
                <h3>各区域房源数量统计</h3>
                <div ref="areaChartContainer" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <h3>每平米价格分布</h3>
                <div ref="priceHistContainer" style="width: 100%; height: 400px;"></div>
            </div>
        </div>

        <!-- 面积分布直方图 和 户型统计 -->
        <div class="chart-row">
            <div class="chart-item">
                <h3>房屋面积大小分布</h3>
                <div ref="areaHistContainer" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <h3>房屋各户型统计</h3>
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
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts/core';
// Import the necessary components and charts
import { BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ParsedHouse } from '../App.vue'; // 导入 ParsedHouse 接口

echarts.use([
    BarChart,
    PieChart,
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
]);

// 定义 props，接收从 App.vue 传递过来的房源数据
const props = defineProps<{ houseData: ParsedHouse[] | null }>();

// 定义图表容器的引用
const areaChartContainer = ref<HTMLElement | null>(null);
const priceHistContainer = ref<HTMLElement | null>(null);
const areaHistContainer = ref<HTMLElement | null>(null);
const unitTypeChartContainer = ref<HTMLElement | null>(null);
const followPriceScatterContainer = ref<HTMLElement | null>(null);
const followAreaScatterContainer = ref<HTMLElement | null>(null);

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

// 绘制户型统计图 (饼图示例)
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

// Watch for changes in the houseData prop and redraw charts
watch(() => props.houseData, (newData) => {
    if (newData) {
        // Need to wait for the DOM elements to be available
        if (areaChartContainer.value) renderAreaChart(areaChartContainer.value as HTMLElement, newData);
        if (priceHistContainer.value) drawUnitPriceDistributionChart(priceHistContainer.value as HTMLElement, newData);
        if (areaHistContainer.value) drawSizeDistributionChart(areaHistContainer.value as HTMLElement, newData);
        if (unitTypeChartContainer.value) renderUnitTypeChart(unitTypeChartContainer.value as HTMLElement, newData);
        if (followPriceScatterContainer.value) renderFollowPriceScatter(followPriceScatterContainer.value as HTMLElement, newData);
        if (followAreaScatterContainer.value) renderFollowAreaScatter(followAreaScatterContainer.value as HTMLElement, newData);
    } else {
        // Clear charts or show a message if data is null
        echarts.dispose(areaChartContainer.value as HTMLElement);
        echarts.dispose(priceHistContainer.value as HTMLElement);
        echarts.dispose(areaHistContainer.value as HTMLElement);
        echarts.dispose(unitTypeChartContainer.value as HTMLElement);
        echarts.dispose(followPriceScatterContainer.value as HTMLElement);
        echarts.dispose(followAreaScatterContainer.value as HTMLElement);
    }
}, { immediate: true }); // Use immediate: true to draw charts on initial data load

</script>

<style scoped>
.charts-2d-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.chart-row {
    display: flex;
    gap: 20px;
}

.chart-item {
    flex: 1;
    min-width: 0;
}

.chart-item>div {
    width: 100%;
}
</style>