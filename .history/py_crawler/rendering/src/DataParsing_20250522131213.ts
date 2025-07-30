import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
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

// Import Three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


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