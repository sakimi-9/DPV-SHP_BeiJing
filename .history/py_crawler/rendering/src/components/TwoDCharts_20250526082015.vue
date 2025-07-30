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

        <!-- 新增行：气泡图 和 平行坐标图 -->
        <div class="chart-row">
            <div class="chart-item">
                <h3>关注人数/单价/面积/户型关系 (气泡图)</h3>
                <div ref="bubbleChartContainer" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <h3>多维度房源特征关系 (平行坐标图)</h3>
                <div ref="parallelChartContainer" style="width: 100%; height: 400px;"></div>
            </div>
        </div>

        <!-- 新增行：面积-单价分面图 和 阶梯热力图 -->
        <div class="chart-row">
            <div class="chart-item">
                <h3>面积-单价关系 (按房龄分面)</h3>
                <div ref="ageFacetScatterContainer" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <h3>区域单价密度 (热力图)</h3>
                <div ref="areaPriceHeatmapContainer" style="width: 100%; height: 400px;"></div>
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
            text: '面积-单价关系 (按房龄分面)',
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
            text: '区域单价密度 (热力图)',
            left: 'center'
        },
        tooltip: {
            formatter: function (params: any) {
                const data = params.data;
                return `区域: ${data[0]}<br/>单价范围: ${data[1]} 元/平<br/>房源数量: ${data[2]}`;
            }
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
            max: Math.max(...heatmapData.map(item => item[2] as number)), // Cast to number
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '10%',
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

        // Render new charts
        if (bubbleChartContainer.value) renderBubbleChart(bubbleChartContainer.value as HTMLElement, newData);
        if (parallelChartContainer.value) renderParallelChart(parallelChartContainer.value as HTMLElement, newData);
        if (ageFacetScatterContainer.value) renderAgeFacetScatterChart(ageFacetScatterContainer.value as HTMLElement, newData);
        if (areaPriceHeatmapContainer.value) renderAreaPriceHeatmap(areaPriceHeatmapContainer.value as HTMLElement, newData);
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
    flex-wrap: wrap;
    /* Allow wrapping on smaller screens */
}

.chart-item {
    flex: 1;
    min-width: 400px;
    /* Give items a minimum width */
}

.chart-item>div {
    width: 100%;
}
</style>