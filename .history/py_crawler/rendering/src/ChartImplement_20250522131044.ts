// Define a ref to store the parsed data
const houseData = ref<ParsedHouse[] | null>(null);

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
let controls: OrbitControls | null = null;
let animationFrameId: number | null = null;

// Function to setup the Three.js scene with data visualization
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    // Cleanup any existing scene first
    cleanupThreeJSScene();

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Adjust camera position to view the data area
    camera.position.set(0, 50, 100); // Example position, may need adjustment
    camera.lookAt(0, 0, 0); // Look at the center


    // 3. Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Prevent right-click context menu (optional, but good practice if not using right-click for anything else)
    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    // 4. Add Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Optional: Add damping for smoother control

    // Enable keyboard controls for pan (WASD and arrow keys)
    controls.enableKeys = true;
    controls.keyPanSpeed = 10.0; // Optional: Adjust keyboard pan speed

    // 5. Add Data Visualization Objects
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1); // Base geometry for all houses
    const material = new THREE.MeshPhongMaterial({ color: 0x0077ff }); // Example material

    // Simple grid layout based on index
    const itemsPerRow = 20; // Number of items per row in the grid
    const spacing = 5; // Spacing between items

    // Find min/max unit price for scaling height
    const validPrices = data.map(house => house.单价).filter((price): price is number => price !== null && !isNaN(price));
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    const priceRange = maxPrice - minPrice;
    const maxHeight = 50; // Maximum height of the bars


    data.forEach((house, index) => {
        // Calculate position in the grid
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        const x = (col - itemsPerRow / 2) * spacing;
        const z = (row - data.length / itemsPerRow / 2) * spacing;

        // Calculate height based on unit price
        let height = 1; // Minimum height
        if (house.单价 !== null && !isNaN(house.单价) && priceRange > 0) {
            height = (house.单价 - minPrice) / priceRange * maxHeight + 1; // Scale price to height
        }

        // Create a mesh for the house
        const houseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(spacing * 0.8, height, spacing * 0.8), // Use a new geometry for each to set different height
            material.clone() // Clone material if you need to change color per house later
        );
        houseMesh.position.set(x, height / 2, z); // Position at the base, height is from center
        // Store original data or relevant info on the mesh for potential interaction later
        (houseMesh as any).userData = { houseData: house };

        scene!.add(houseMesh);
    });


    // 6. Add Light (needed for MeshPhongMaterial)
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene!.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100).normalize();
    scene!.add(directionalLight);

    // Add ground plane (optional, but helps with context)
    const groundGeometry = new THREE.PlaneGeometry(itemsPerRow * spacing * 2, data.length / itemsPerRow * spacing * 2);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundPlane.position.y = 0; // Place at the base
    scene!.add(groundPlane);


    // 7. Animation Loop
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (controls) controls.update(); // Update controls in the animation loop
        // No automatic object rotation here
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
    (renderer.domElement as any).__contextMenuHandler = contextMenuHandler; // Store reference to remove later


    console.log('Three.js scene setup complete with data visualization.');
};

// Function to cleanup the Three.js scene
const cleanupThreeJSScene = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }
    if (controls) {
        controls.dispose(); // Dispose controls
        controls = null;
    }
    if (renderer) {
        // Remove canvas from DOM
        if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        // Remove contextmenu listener
        if ((renderer.domElement as any).__contextMenuHandler) {
            renderer.domElement.removeEventListener('contextmenu', (renderer.domElement as any).__contextMenuHandler);
            delete (renderer.domElement as any).__contextMenuHandler;
        }
        renderer.dispose();
        renderer = null;
    }
    if (scene) {
        // Dispose scene objects and geometry/materials if necessary for complex scenes
        // A simple way to dispose children:
        while (scene.children.length > 0) {
            const object = scene.children[0];
            if (object instanceof THREE.Mesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    // Dispose materials
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
            scene.remove(object);
        }
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
        houseData.value = parseHouseData(rawHouseData);

        console.log('解析后的数据并存储:', houseData.value); // 打印解析后的数据以便检查

        // Initial render based on current mode
        if (currentMode.value === '2D') {
            // Redraw all 2D charts on mount if in 2D mode
            if (areaChartContainer.value && houseData.value) renderAreaChart(areaChartContainer.value as HTMLElement, houseData.value);
            if (priceHistContainer.value && houseData.value) drawUnitPriceDistributionChart(priceHistContainer.value as HTMLElement, houseData.value);
            if (areaHistContainer.value && houseData.value) drawSizeDistributionChart(areaHistContainer.value as HTMLElement, houseData.value);
            if (unitTypeChartContainer.value && houseData.value) renderUnitTypeChart(unitTypeChartContainer.value as HTMLElement, houseData.value);
            if (followPriceScatterContainer.value && houseData.value) renderFollowPriceScatter(followPriceScatterContainer.value as HTMLElement, houseData.value);
            if (followAreaScatterContainer.value && houseData.value) renderFollowAreaScatter(followAreaScatterContainer.value as HTMLElement, houseData.value);

        } else if (currentMode.value === '3D') {
            // Setup 3D scene on mount if in 3D mode
            if (threeContainer.value && houseData.value) {
                setupThreeJSScene(threeContainer.value as HTMLElement, houseData.value);
            }
        }

    } catch (error) {
        console.error('Error loading or processing data:', error);
    }
});

// Watch for mode changes to setup/cleanup scenes and redraw 2D charts
watch(currentMode, async (newMode, oldMode) => {
    console.log('Mode switched from', oldMode, 'to', newMode);

    if (newMode === '3D') {
        cleanupThreeJSScene(); // Ensure old scene is cleaned up
        await nextTick(); // Wait for DOM update
        if (threeContainer.value && houseData.value) {
            console.log('Attempting to setup 3D scene after nextTick:', threeContainer.value);
            setupThreeJSScene(threeContainer.value as HTMLElement, houseData.value);
        } else if (!threeContainer.value) {
            console.warn('threeContainer.value is still null after nextTick when attempting to switch to 3D mode.');
        } else if (!houseData.value) {
            console.warn('houseData.value is null when attempting to switch to 3D mode.');
        }
    } else if (newMode === '2D') {
        cleanupThreeJSScene(); // Cleanup 3D scene
        await nextTick(); // Wait for DOM update to ensure 2D containers are in DOM
        // Redraw 2D charts
        if (houseData.value) {
            if (areaChartContainer.value) renderAreaChart(areaChartContainer.value as HTMLElement, houseData.value);
            if (priceHistContainer.value) drawUnitPriceDistributionChart(priceHistContainer.value as HTMLElement, houseData.value);
            if (areaHistContainer.value) drawSizeDistributionChart(areaHistContainer.value as HTMLElement, houseData.value);
            if (unitTypeChartContainer.value) renderUnitTypeChart(unitTypeChartContainer.value as HTMLElement, houseData.value);
            if (followPriceScatterContainer.value) renderFollowPriceScatter(followPriceScatterContainer.value as HTMLElement, houseData.value);
            if (followAreaScatterContainer.value) renderFollowAreaScatter(followAreaScatterContainer.value as HTMLElement, houseData.value);
        } else {
            console.warn('houseData.value is null when attempting to switch to 2D mode and redraw charts.');
        }
    }
});

onUnmounted(() => {
    cleanupThreeJSScene(); // Cleanup 3D scene when component is unmounted
});
