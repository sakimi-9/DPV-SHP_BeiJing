<template>
    <div ref="threeContainer" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 定义解析后的房源数据接口 (重新定义，包含经纬度)
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

// 定义接收的房源数据属性
const props = defineProps({
    houseData: { // 这里应该是一个包含经纬度的 ParsedHouse 数组
        type: Array as () => ParsedHouse[], // Explicitly type the array content
        default: () => []
    }
});

const threeContainer = ref<HTMLElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let dataGroup: THREE.Group | null = null; // Group to hold the data visualization objects

// Beijing approximate bounds (adjust based on data)
const MIN_LAT = 39.6; // Lower latitude for Beijing
const MAX_LAT = 40.8; // Upper latitude for Beijing
const MIN_LNG = 115.9; // Left longitude for Beijing
const MAX_LNG = 117.0; // Right longitude for Beijing

// Plane dimensions (scaled up 1.5 times and centered)
const PLANE_WIDTH = (MAX_LNG - MIN_LNG) * 1000 * 1.5; // Scale longitude difference
const PLANE_HEIGHT = (MAX_LAT - MIN_LAT) * 1000 * 1.5; // Scale latitude difference

// Offset to center the plane roughly around Beijing
const PLANE_OFFSET_X = (MIN_LNG + MAX_LNG) / 2;
const PLANE_OFFSET_Y = (MIN_LAT + MAX_LAT) / 2;

// Animation loop (defined outside setupThreeJSScene)
const animate = () => {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
};

const setupThreeJSScene = () => {
    console.log('setupThreeJSScene called');
    if (!threeContainer.value || !props.houseData || props.houseData.length === 0) {
        console.log('Container or data not ready', { container: threeContainer.value, dataLength: props.houseData?.length });
        // If data is empty but container is ready, still start animation for controls
        if (threeContainer.value && !renderer) { // Prevent multiple renderers if data comes later
            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
            threeContainer.value.appendChild(renderer.domElement);
            // Camera
            camera = new THREE.PerspectiveCamera(
                75,
                threeContainer.value.clientWidth / threeContainer.value.clientHeight,
                0.1,
                10000
            );
            // Position the camera looking down on the plane
            camera.position.set(PLANE_OFFSET_X, 1500, PLANE_OFFSET_Y);
            camera.lookAt(PLANE_OFFSET_X, 0, PLANE_OFFSET_Y);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;
            animate(); // Start animation loop if not already running
        }
        return;
    }

    console.log('Container and data ready. Initializing Three.js');

    // Clear previous scene if exists
    if (scene) {
        // Dispose geometries, materials, textures etc.
        scene.traverse((object) => {
            // Use instanceof to check object type
            if (!(object instanceof THREE.Mesh)) return;

            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
                // single material
                object.material.dispose();
            } else if (Array.isArray(object.material)) {
                // array of materials
                for (const m of object.material) m.dispose();
            }
        });
        scene = null;
        // Only dispose renderer and controls if they exist before creating new ones
        if (renderer) {
            renderer.dispose();
            // Remove the old renderer's DOM element before appending a new one
            if (renderer.domElement.parentNode === threeContainer.value) {
                threeContainer.value.removeChild(renderer.domElement);
            }
            renderer = null;
        }
        if (controls) {
            controls.dispose();
            controls = null;
        }
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Camera (re-initialize if scene was cleared or if it wasn't created yet)
    if (!camera) {
        camera = new THREE.PerspectiveCamera(
            75,
            threeContainer.value.clientWidth / threeContainer.value.clientHeight,
            0.1,
            10000
        );
        // Position the camera looking down on the plane
        camera.position.set(PLANE_OFFSET_X, 1500, PLANE_OFFSET_Y);
        camera.lookAt(PLANE_OFFSET_X, 0, PLANE_OFFSET_Y);
    }

    // Renderer (re-initialize if scene was cleared or if it wasn't created yet)
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
        threeContainer.value.appendChild(renderer.domElement);
    }

    // Controls (re-initialize if scene was cleared or if it wasn't created yet)
    if (!controls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Base Plane (using Y-up coordinate system)
    const planeGeometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // Green color for land
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lay flat on XZ plane
    plane.position.set(PLANE_OFFSET_X, 0, PLANE_OFFSET_Y);
    scene.add(plane);

    // Group for data visualization elements
    // Dispose of previous dataGroup if it exists
    if (dataGroup) {
        scene.remove(dataGroup);
        // Dispose children geometries/materials if necessary, though the traverse above should handle this
        dataGroup = null;
    }
    dataGroup = new THREE.Group();
    dataGroup.position.set(PLANE_OFFSET_X, 0, PLANE_OFFSET_Y); // Position the group at the plane center
    scene.add(dataGroup);

    // Add Axes Helper for debugging
    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);

    // Add Grid Helper
    const gridHelper = new THREE.GridHelper(PLANE_WIDTH, 100, 0x000000, 0x000000);
    gridHelper.position.set(PLANE_OFFSET_X, 0.1, PLANE_OFFSET_Y);
    scene.add(gridHelper);


    // --- Data Processing and Visualization ---

    // Filter out data points without location
    const houseDataWithLocation = props.houseData.filter(item => item.location);
    console.log('Filtered data with location:', houseDataWithLocation.length, 'items');

    if (houseDataWithLocation.length === 0) {
        console.log('No data with location to visualize.');
        // animate(); // Animation already started if container was ready but data was empty
        return;
    }

    // Aggregate data by area
    const aggregatedData = new Map(); // Map<AreaName, { count: number, totalPrice: number, location: { lng: number, lat: number } }>

    houseDataWithLocation.forEach(item => {
        const area = item.所在区域;
        if (area && item.单价 !== null && item.面积 !== null && item.location) { // Explicitly check for null
            if (!aggregatedData.has(area)) {
                aggregatedData.set(area, { count: 0, totalPrice: 0, location: item.location });
            }
            const areaData = aggregatedData.get(area);
            areaData.count++;
            areaData.totalPrice += item.单价 * item.面积; // Approximate total price for average calculation
        }
    });

    console.log('Aggregated data for', aggregatedData.size, 'areas:', aggregatedData);

    if (aggregatedData.size === 0) {
        console.log('No aggregated data to visualize.');
        return;
    }

    // Find max count and max average price for normalization
    let maxCount = 0;
    let maxAvgPrice = 0;

    aggregatedData.forEach(data => {
        maxCount = Math.max(maxCount, data.count);
        maxAvgPrice = Math.max(maxAvgPrice, data.totalPrice / data.count);
    });

    // Create pillars for each area
    aggregatedData.forEach(data => {
        const avgPrice = data.totalPrice / data.count;

        // Convert lat/lng to scene coordinates (relative to plane center)
        // Simple linear mapping (adjust scaling factor as needed)
        const x = (data.location.lng - PLANE_OFFSET_X) * 1000;
        const z = (data.location.lat - PLANE_OFFSET_Y) * 1000; // Use Z for latitude

        // Pillar height based on count (normalized)
        const height = (data.count / maxCount) * 200; // Max height 200 units (adjust as needed)
        const radius = 10; // Pillar radius (adjust as needed)

        // Pillar color based on average price (simple gradient, e.g., blue to red)
        const normalizedPrice = maxAvgPrice > 0 ? avgPrice / maxAvgPrice : 0; // Avoid division by zero
        const color = new THREE.Color().setHSL(0.6 - normalizedPrice * 0.6, 1, 0.5); // Hue from blue (0.6) to red (0.0)

        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const pillar = new THREE.Mesh(geometry, material);

        // Position the pillar base at Y=0
        pillar.position.set(x, height / 2, z);
        dataGroup?.add(pillar); // Add pillar to the data group
    });

    // Animation loop is already started if container was ready
};

// Watch for changes in houseData and re-setup the scene
watch(() => props.houseData, (newHouseData, oldHouseData) => {
    console.log('houseData watched. New data length:', newHouseData?.length, 'Old data length:', oldHouseData?.length);
    // Check if data is actually different before re-setting up the scene
    // A simple length check might not be sufficient for real data changes
    // For now, we rely on the immediate: true and subsequent data updates
    setupThreeJSScene();
}, { immediate: true }); // immediate: true ensures the watcher runs on initial component mount


// Handle window resize
const onWindowResize = () => {
    if (camera && renderer && threeContainer.value) {
        camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
    }
};

onMounted(() => {
    console.log('ThreeDVisualization mounted');
    window.addEventListener('resize', onWindowResize);
    // Initial setup call is handled by the immediate watcher
    // Start animation loop when mounted if not already started by the data watcher
    if (!renderer) { // Check if renderer was not created by the watcher yet
        // Create a basic scene/camera/renderer and start the animation loop
        setupThreeJSScene(); // This will handle the case where data is initially empty
    }
});

onBeforeUnmount(() => {
    console.log('ThreeDVisualization unmounting');
    window.removeEventListener('resize', onWindowResize);
    // Clean up Three.js resources
    if (scene) {
        scene.traverse((object) => {
            // Use instanceof to check object type
            if (!(object instanceof THREE.Mesh)) return;
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
                object.material.dispose();
            } else if (Array.isArray(object.material)) {
                for (const m of object.material) m.dispose();
            }
        });
        if (dataGroup) {
            scene.remove(dataGroup);
            dataGroup = null;
        }
        scene = null;
    }
    if (renderer) {
        // Ensure the DOM element is removed
        if (renderer.domElement.parentNode === threeContainer.value) {
            threeContainer.value.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
    }
    if (controls) {
        controls.dispose();
        controls = null;
    }
});

</script>

<style scoped>
.three-container {
    width: 100%;
    height: 600px;
    /* Adjust height as needed */
    display: block;
    margin: 20px auto;
    /* Center the container */
    border: 1px solid #ccc;
}
</style>