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

// Placeholder function for generating chart textures
// This will be implemented later to render the 2D charts onto canvases
function generateChartTexture(chartType: string, data: ParsedHouse[]): THREE.Texture | null {
    // Basic example: create a dummy texture for now
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.fillText(chartType, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Function to setup the Three.js scene with the cube
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    console.log('setupThreeJSScene called for cube.');

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

    // Prevent right-click context menu
    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    // 4. Add Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.keyPanSpeed = 10.0;

    // 5. Create Cube with Placeholder Textures
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Generate placeholder textures for each face
    const chartTypes = [
        '图表 1', // Example: 区域房源数量柱状图
        '图表 2', // Example: 单价分布直方图
        '图表 3', // Example: 面积分布直方图
        '图表 4', // Example: 房型分布饼图
        '图表 5', // Example: 关注人数与单价散点图
        '图表 6'  // Example: 建筑年份与单价散点图
    ];

    const materials = chartTypes.map(type => {
        const texture = generateChartTexture(type, data);
        return new THREE.MeshBasicMaterial({ map: texture });
    });

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // 6. Add Light (Optional for Basic Material, but good practice)
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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

    console.log('Three.js cube scene setup complete.');
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
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                        //  console.log('Disposed array material');
                    } else {
                        object.material.dispose();
                        //  console.log('Disposed single material');
                    }
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
        console.log('houseData updated, attempting to setup 3D cube scene.');
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