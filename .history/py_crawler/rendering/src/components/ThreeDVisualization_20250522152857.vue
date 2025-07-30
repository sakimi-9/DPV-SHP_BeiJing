<template>
    <div>
        <h2>3D 图表 (可旋转立方体)</h2>
        <p>在立方体六个面上展示2D图表。</p>
        <div ref="threeContainer" style="width: 800px; height: 500px; border: 1px solid #ccc;"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as echarts from 'echarts/core';
// Import the necessary components and charts
import { BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

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

// 定义解析后的房源数据接口 (从 App.vue 复制过来，确保类型可用)
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
    // 添加经纬度信息 (假设数据中已包含)
    location?: { lng: number; lat: number };
}

// 定义接收的 props
const props = defineProps<{ houseData: ParsedHouse[] | null }>();

// Three.js related variables
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let animationFrameId: number | null = null;

const threeContainer = ref<HTMLElement | null>(null); // 3D 容器引用

// --- Echarts Chart Rendering Functions (adapted for Canvas) ---

// 绘制各区域房源数量统计图到 Canvas
function renderAreaChartToCanvas(canvas: HTMLCanvasElement, data: ParsedHouse[]) {
    const areaCounts: { [key: string]: number } = {};
    data.forEach((item: ParsedHouse) => {
        if (item.所在区域) {
            areaCounts[item.所在区域] = (areaCounts[item.所在区域] || 0) + 1;
        }
    });

    const areas = Object.keys(areaCounts);
    const counts = Object.values(areaCounts);

    const myChart = echarts.init(canvas);
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
    myChart.dispose(); // Dispose the chart instance after rendering
}

// Function to draw the unit price distribution histogram to Canvas
const drawUnitPriceDistributionChartToCanvas = (canvas: HTMLCanvasElement, parsedData: ParsedHouse[]) => {
    const prices = parsedData
        .map(house => house.单价)
        .filter((price): price is number => price !== null && !isNaN(price)); // Filter out null/NaN values

    if (prices.length === 0) {
        console.warn("No valid price data to draw histogram.");
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('暂无单价分布数据', canvas.width / 2, canvas.height / 2);
        }
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

    const chart = echarts.init(canvas);
    const options = {
        title: { text: '单价分布' },
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
    chart.dispose(); // Dispose the chart instance after rendering
};

// Function to draw the size distribution histogram to Canvas
const drawSizeDistributionChartToCanvas = (canvas: HTMLCanvasElement, parsedData: ParsedHouse[]) => {
    const sizes = parsedData
        .map(house => house.面积)
        .filter((size): size is number => size !== null && !isNaN(size)); // Filter out null/NaN values

    if (sizes.length === 0) {
        console.warn("No valid size data to draw histogram.");
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('暂无面积分布数据', canvas.width / 2, canvas.height / 2);
        }
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


    const chart = echarts.init(canvas);
    const options = {
        title: { text: '面积分布' },
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
    chart.dispose(); // Dispose the chart instance after rendering
};

// Function to draw the unit type chart to Canvas (Pie Chart)
const drawUnitTypeChartToCanvas = (canvas: HTMLCanvasElement, parsedData: ParsedHouse[]) => {
    const unitTypeCounts: { [key: string]: number } = {};
    parsedData.forEach(house => {
        if (house.室 !== null && house.厅 !== null) {
            const unitType = `${house.室}室${house.厅}厅`;
            unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
        } else if (house.室 !== null) {
            const unitType = `${house.室}室`;
            unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
        } else if (house.厅 !== null) {
            const unitType = `${house.厅}厅`;
            unitTypeCounts[unitType] = (unitTypeCounts[unitType] || 0) + 1;
        }
    });

    if (Object.keys(unitTypeCounts).length === 0) {
        console.warn("No valid unit type data to draw pie chart.");
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('暂无户型统计数据', canvas.width / 2, canvas.height / 2);
        }
        return;
    }

    const chart = echarts.init(canvas);
    const options = {
        title: { text: '户型统计', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                name: '户型',
                type: 'pie',
                radius: '50%',
                data: Object.keys(unitTypeCounts).map(key => ({ name: key, value: unitTypeCounts[key] })),
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
    chart.setOption(options);
    chart.dispose(); // Dispose the chart instance after rendering
};

// Function to draw the follow count vs unit price scatter plot to Canvas
const drawFollowPriceScatterChartToCanvas = (canvas: HTMLCanvasElement, parsedData: ParsedHouse[]) => {
    const scatterData = parsedData
        .filter(house => house.关注人数 !== null && house.单价 !== null && !isNaN(house.关注人数) && !isNaN(house.单价))
        .map(house => [house.关注人数!, house.单价!, house.房源标题]); // [关注人数, 单价, 房源标题]

    if (scatterData.length === 0) {
        console.warn("No valid follow count vs price data to draw scatter plot.");
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('暂无关注人数与单价关系数据', canvas.width / 2, canvas.height / 2);
        }
        return;
    }

    const chart = echarts.init(canvas);
    const options = {
        title: { text: '关注人数与单价关系' },
        tooltip: {
            formatter: function (params: any) {
                const data = params.data;
                return `房源: ${data[2]}<br/>关注人数: ${data[0]}<br/>单价: ${data[1]}`;
            }
        },
        xAxis: { type: 'value', name: '关注人数' },
        yAxis: { type: 'value', name: '单价' },
        series: [{
            name: '房源',
            type: 'scatter',
            data: scatterData,
            symbolSize: 5
        }]
    };
    chart.setOption(options);
    chart.dispose(); // Dispose the chart instance after rendering
};

// Function to draw the follow count vs area scatter plot to Canvas
const drawFollowAreaScatterChartToCanvas = (canvas: HTMLCanvasElement, parsedData: ParsedHouse[]) => {
    const scatterData = parsedData
        .filter(house => house.关注人数 !== null && house.面积 !== null && !isNaN(house.关注人数) && !isNaN(house.面积))
        .map(house => [house.关注人数!, house.面积!, house.房源标题]); // [关注人数, 面积, 房源标题]

    if (scatterData.length === 0) {
        console.warn("No valid follow count vs area data to draw scatter plot.");
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('暂无关注人数与面积关系数据', canvas.width / 2, canvas.height / 2);
        }
        return;
    }

    const chart = echarts.init(canvas);
    const options = {
        title: { text: '关注人数与面积关系' },
        tooltip: {
            formatter: function (params: any) {
                const data = params.data;
                return `房源: ${data[2]}<br/>关注人数: ${data[0]}<br/>面积: ${data[1]}平米`;
            }
        },
        xAxis: { type: 'value', name: '关注人数' },
        yAxis: { type: 'value', name: '面积 (平米)' },
        series: [{
            name: '房源',
            type: 'scatter',
            data: scatterData,
            symbolSize: 5
        }]
    };
    chart.setOption(options);
    chart.dispose(); // Dispose the chart instance after rendering
};

// Function to generate chart textures
function generateChartTexture(chartType: string, data: ParsedHouse[]): THREE.Texture | null {
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Set a fixed size for the texture
    canvas.height = 512;

    // Render the appropriate chart based on chartType
    switch (chartType) {
        case 'areaChart':
            renderAreaChartToCanvas(canvas, data);
            break;
        case 'priceHistChart':
            drawUnitPriceDistributionChartToCanvas(canvas, data);
            break;
        case 'areaHistChart':
            drawSizeDistributionChartToCanvas(canvas, data);
            break;
        case 'unitTypeChart':
            drawUnitTypeChartToCanvas(canvas, data);
            break;
        case 'followPriceScatter':
            drawFollowPriceScatterChartToCanvas(canvas, data);
            break;
        case 'followAreaScatter':
            drawFollowAreaScatterChartToCanvas(canvas, data);
            break;
        default:
            console.warn(`Unknown chart type: ${chartType}`);
            // Render a placeholder or error message
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = 'red';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText('Chart Error', canvas.width / 2, canvas.height / 2);
            }
            break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // *** DEBUG LOG ***
    console.log(`Generated texture for ${chartType}: Canvas dimensions ${canvas.width}x${canvas.height}, needsUpdate: ${texture.needsUpdate}`);
    // Check if the canvas is blank (optional, can be resource intensive)
    // const ctx = canvas.getContext('2d');
    // if (ctx) {
    //     const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    //     let blank = true;
    //     for (let i = 0; i < data.length; i++) {
    //         if (data[i] !== 0) {
    //             blank = false;
    //             break;
    //         }
    //     }
    //     if (blank) {
    //         console.warn(`Canvas for ${chartType} is blank.`);
    //     }
    // }
    // *****************

    return texture;
}

// Function to setup the Three.js scene with the cube
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    console.log('setupThreeJSScene called for cube.');

    // Cleanup any existing scene first
    cleanupThreeJSScene();

    if (!data || data.length === 0) {
        console.warn("No data to render 3D cube.");
        if (container) {
            container.innerHTML = '<p>暂无数据用于3D可视化。</p>';
        }
        return;
    }

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3; // Move camera closer to see the cube better

    // 3. Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Prevent right-click context menu
    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    // 4. Add Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.keyPanSpeed = 10.0;
    controls.target.set(0, 0, 0); // Ensure controls target the center of the cube

    // 5. Create Cube with Chart Textures
    const geometry = new THREE.BoxGeometry(2, 2, 2); // Increase cube size for better visibility

    // Generate chart textures for each face
    const chartTypes = [
        'areaChart', // +X face
        'priceHistChart', // -X face
        'areaHistChart', // +Y face
        'unitTypeChart', // -Y face
        'followPriceScatter', // +Z face
        'followAreaScatter'  // -Z face
    ];

    const materials = chartTypes.map(type => {
        const texture = generateChartTexture(type, data);
        // Use MeshStandardMaterial or MeshPhongMaterial for lighting effects if desired
        // For simple display of charts, MeshBasicMaterial is sufficient
        return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff });
    });

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // 6. Add Light (Optional for Basic Material, but good practice)
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Increase light intensity
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);


    // 7. Animation Loop
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (controls) controls.update();
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

    // Store resize handler and contextmenu handler to remove them later
    (container as any).__resizeHandler = handleResize;
    const contextMenuHandler = (event: MouseEvent) => event.preventDefault();
    renderer.domElement.addEventListener('contextmenu', contextMenuHandler);
    (renderer.domElement as any).__contextMenuHandler = contextMenuHandler;

    console.log('Three.js cube scene setup complete with chart textures.');
};

// Function to cleanup the Three.js scene
const cleanupThreeJSScene = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // Reset animation frame ID
    }
    if (controls) {
        controls.dispose();
        controls = null;
    }
    if (renderer) {
        if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if ((renderer.domElement as any).__contextMenuHandler) {
            renderer.domElement.removeEventListener('contextmenu', (renderer.domElement as any).__contextMenuHandler);
            delete (renderer.domElement as any).__contextMenuHandler;
        }
        renderer.dispose();
        renderer = null;
    }
    if (scene) {
        // Dispose scene objects and geometry/materials
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                    // console.log('Disposed geometry');
                }
                if (object.material) {
                    // Materials can be an array for a BoxGeometry
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => {
                            if (m.map) m.map.dispose(); // Dispose texture
                            m.dispose();
                        });
                    } else {
                        if (object.material.map) object.material.map.dispose(); // Dispose texture
                        object.material.dispose();
                    }
                    //  console.log('Disposed single material');
                }
            }
        });
        scene.clear(); // Clear all objects from the scene
        scene = null;
    }
    if (camera) {
        camera = null;
    }
    if (threeContainer.value && (threeContainer.value as any).__resizeHandler) {
        window.removeEventListener('resize', (threeContainer.value as any).__resizeHandler);
        delete (threeContainer.value as any).__resizeHandler;
    }
    console.log('Three.js scene cleanup complete.');
};

// Watch for changes in the houseData prop and setup the 3D scene
watch(() => props.houseData, (newData) => {
    // *** DEBUG LOG ***
    console.log('Watch triggered. New houseData:', newData);
    // *****************
    // Only attempt setup if both data and container are available
    if (newData && threeContainer.value) {
        // *** DEBUG LOG ***
        console.log('Condition met in watch: newData and threeContainer.value are available.');
        // *****************
        console.log('houseData updated, attempting to setup 3D cube scene with charts.');
        setupThreeJSScene(threeContainer.value as HTMLElement, newData);
    } else if (!newData) {
        cleanupThreeJSScene(); // Cleanup if data becomes null (e.g., error loading or mode switch)
    }
}, { immediate: true }); // Use immediate: true to setup scene on initial data load

// Setup the scene when the component is mounted and the container is available
onMounted(() => {
    console.log('ThreeDVisualization mounted.');
    // After mounting, check if data is already available and setup scene if so
    if (props.houseData && threeContainer.value) {
        // *** DEBUG LOG ***
        console.log('Condition met in onMounted: houseData and threeContainer.value are available.');
        // *****************
        console.log('Component mounted and data already loaded, setting up scene.');
        setupThreeJSScene(threeContainer.value as HTMLElement, props.houseData);
    }
});

onUnmounted(() => {
    cleanupThreeJSScene();
});

</script>

<style scoped>
/* Add any specific styles for the 3D visualization container if needed */
</style>