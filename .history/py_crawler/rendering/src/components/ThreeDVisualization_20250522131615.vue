<template>
    <div>
        <h2>3D 图表</h2>
        <p>3D 可视化功能待开发...</p>
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

// Function to setup the Three.js scene with data visualization
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    // Cleanup any existing scene first
    cleanupThreeJSScene();

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // 3. Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Prevent right-click context menu
    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    // 4. Add Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // Removed controls.enableKeys = true; as it caused a linter error and may not be needed.
    controls.keyPanSpeed = 10.0;

    // 5. Add Data Visualization Objects
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1); // Base geometry for all houses
    const material = new THREE.MeshPhongMaterial({ color: 0x0077ff }); // Example material

    // Simple grid layout based on index
    const itemsPerRow = 20;
    const spacing = 5;

    // Find min/max unit price for scaling height
    const validPrices = data.map(house => house.单价).filter((price): price is number => price !== null && !isNaN(price));
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    const priceRange = maxPrice - minPrice;
    const maxHeight = 50;


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
            new THREE.BoxGeometry(spacing * 0.8, height, spacing * 0.8),
            material.clone()
        );
        houseMesh.position.set(x, height / 2, z);
        (houseMesh as any).userData = { houseData: house };

        scene!.add(houseMesh);
    });


    // 6. Add Light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene!.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100).normalize();
    scene!.add(directionalLight);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(itemsPerRow * spacing * 2, data.length / itemsPerRow * spacing * 2);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    scene!.add(groundPlane);

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

    console.log('Three.js scene setup complete with data visualization.');
};

// Function to cleanup the Three.js scene
const cleanupThreeJSScene = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
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
        while (scene.children.length > 0) {
            const object = scene.children[0];
            if (object instanceof THREE.Mesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        material.dispose();
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

// Watch for changes in the houseData prop and setup the 3D scene
watch(() => props.houseData, (newData) => {
    if (newData && threeContainer.value) {
        console.log('houseData updated, attempting to setup 3D scene.');
        setupThreeJSScene(threeContainer.value as HTMLElement, newData);
    } else if (!newData) {
        cleanupThreeJSScene(); // Cleanup if data becomes null (e.g., error loading)
    }
}, { immediate: true }); // Use immediate: true to setup scene on initial data load

// Setup the scene when the component is mounted and the container is available
onMounted(() => {
    if (threeContainer.value && props.houseData) {
        console.log('ThreeDVisualization mounted, setting up 3D scene.');
        setupThreeJSScene(threeContainer.value, props.houseData);
    } else if (!threeContainer.value) {
        console.warn('threeContainer.value is null on mount for ThreeDVisualization.');
    } else if (!props.houseData) {
        console.warn('houseData is null on mount for ThreeDVisualization.');
    }
});

onUnmounted(() => {
    cleanupThreeJSScene();
});

</script>

<style scoped>
/* Add any specific styles for the 3D visualization container if needed */
</style>