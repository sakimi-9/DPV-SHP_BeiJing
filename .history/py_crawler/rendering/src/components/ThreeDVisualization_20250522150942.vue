<template>
    <div>
        <h2>3D 图表 (地图热力图)</h2>
        <p>基于区域房源数量和平均价格的3D可视化。</p>
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

// Function to map latitude/longitude to Three.js x, z coordinates
// This requires defining a geographical bounding box for your data
// and mapping it to the size of your 3D plane.
// Example (you might need to adjust these ranges and scaling factors):
const MIN_LAT = 39.0; // Adjusted for Beijing
const MAX_LAT = 42.0; // Adjusted for Beijing
const MIN_LNG = 115.0; // Adjusted for Beijing
const MAX_LNG = 118.0; // Adjusted for Beijing
const PLANE_WIDTH = 750; // Adjusted size
const PLANE_HEIGHT = 750; // Adjusted size

function latLonToVector3(lat: number, lon: number): THREE.Vector3 {
    const x = ((lon - MIN_LNG) / (MAX_LNG - MIN_LNG)) * PLANE_WIDTH - PLANE_WIDTH / 2;
    // Use latitude for the z-axis in Three.js (assuming a standard map orientation)
    // Invert latitude mapping if needed depending on desired orientation
    const z = ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * PLANE_HEIGHT - PLANE_HEIGHT / 2;
    // Assuming y is height (0 for the base plane)
    return new THREE.Vector3(x, 0, z);
}

// Function to setup the Three.js scene with data visualization
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    // *** DEBUG LOG ***
    console.log('setupThreeJSScene called.');
    // *****************

    // Cleanup any existing scene first
    cleanupThreeJSScene();

    // Filter out data without location
    const dataWithLocation = data.filter(item => item.location);

    // *** DEBUG LOG ***
    console.log(`Data with location count: ${dataWithLocation.length}`);
    // *****************

    if (dataWithLocation.length === 0) {
        console.warn("No data with location information to render 3D map.");
        // Optional: Display a message in the container
        if (container) {
            container.innerHTML = '<p>暂无包含地理位置信息的数据用于3D可视化。</p>';
        }
        return;
    }

    // Group data by location (小区名称 + 所在区域) to aggregate counts and average prices
    const locationData = new Map<string, { count: number; total_price: number; location: { lng: number; lat: number } }>();

    dataWithLocation.forEach(house => {
        const locationKey = `${house.小区名称}  ${house.所在区域}`;
        if (!locationData.has(locationKey)) {
            locationData.set(locationKey, { count: 0, total_price: 0, location: house.location! });
        }
        const current = locationData.get(locationKey)!;
        current.count++;
        if (house.单价 !== null) {
            current.total_price += house.单价;
        }
    });

    const aggregatedData = Array.from(locationData.entries()).map(([key, value]) => ({
        name: key,
        count: value.count,
        average_price: value.count > 0 ? value.total_price / value.count : 0,
        location: value.location,
    }));

    // *** DEBUG LOG ***
    console.log(`Aggregated data count: ${aggregatedData.length}`);
    // *****************

    // Find max count and max average price for scaling
    const maxCount = Math.max(...aggregatedData.map(item => item.count));
    const maxAveragePrice = Math.max(...aggregatedData.map(item => item.average_price));

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000); // Adjust far plane
    // Position camera for a better view of the map
    camera.position.set(0, 400, 400); // Example angled view
    camera.lookAt(0, 0, 0); // Look at the center of the plane

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
    // Optional: restrict rotation to prevent going upside down
    controls.maxPolarAngle = Math.PI / 2.1; // Keep slightly above the ground

    // 5. Add Base Map Plane
    const groundGeometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc }); // Or load a map texture here
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundPlane.position.y = 0; // Place at the base
    scene!.add(groundPlane);

    // 6. Add Data Visualization Objects (Heatmap Cylinders)
    const maxBarHeight = 200; // Maximum height for the bars

    // Define a color scale for average price (e.g., blue to red)
    const colorScale = (price: number) => {
        const ratio = maxAveragePrice > 0 ? price / maxAveragePrice : 0;
        // Interpolate between blue (low price) and red (high price)
        const color = new THREE.Color(0x0000ff).lerp(new THREE.Color(0xff0000), ratio);
        return color;
    };


    aggregatedData.forEach(item => {
        // Calculate position based on lat/lon
        const position = latLonToVector3(item.location.lat, item.location.lng);

        // Calculate height based on count (log scale might be better for skewed data)
        const height = maxCount > 0 ? (item.count / maxCount) * maxBarHeight + 1 : 1; // Add a minimum height

        // Create a cylinder for the location
        const geometry = new THREE.CylinderGeometry(5, 5, height, 16); // Adjust radius and segments
        const material = new THREE.MeshPhongMaterial({ color: colorScale(item.average_price) });

        const cylinder = new THREE.Mesh(geometry, material);

        // Position the cylinder at the base of its height
        cylinder.position.set(position.x, height / 2, position.z);

        // Store data for potential interaction (optional)
        (cylinder as any).userData = { locationData: item };

        // *** DEBUG LOG ***
        console.log(`Created cylinder for ${item.name}: Position (${cylinder.position.x.toFixed(2)}, ${cylinder.position.y.toFixed(2)}, ${cylinder.position.z.toFixed(2)}), Height: ${height.toFixed(2)}, Count: ${item.count}, AvgPrice: ${item.average_price.toFixed(2)}`);
        // *****************

        scene!.add(cylinder);
    });


    // 7. Add Light
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene!.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 400, 300).normalize();
    scene!.add(directionalLight);


    // 8. Animation Loop
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
        } else if (container) { // If renderer or camera are null but container exists, try to re-setup
            console.warn("Renderer or Camera null on resize, attempting to re-setup.");
            if (threeContainer.value && props.houseData) {
                setupThreeJSScene(threeContainer.value, props.houseData);
            }
        }
    };
    window.addEventListener('resize', handleResize);

    // Store resize handler and contextmenu handler to remove them later
    (container as any).__resizeHandler = handleResize;
    const contextMenuHandler = (event: MouseEvent) => event.preventDefault();
    renderer.domElement.addEventListener('contextmenu', contextMenuHandler);
    (renderer.domElement as any).__contextMenuHandler = contextMenuHandler;

    console.log('Three.js map heatmap scene setup complete.');
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
    if (newData && threeContainer.value) {
        // *** DEBUG LOG ***
        console.log('Condition met: newData and threeContainer.value are available.');
        // *****************
        console.log('houseData updated, attempting to setup 3D map heatmap scene.');
        setupThreeJSScene(threeContainer.value as HTMLElement, newData);
    } else if (!newData) {
        cleanupThreeJSScene(); // Cleanup if data becomes null (e.g., error loading or mode switch)
    }
}, { immediate: true }); // Use immediate: true to setup scene on initial data load

// Setup the scene when the component is mounted and the container is available
onMounted(() => {
    // The watch handler with immediate: true will handle the initial setup
    console.log('ThreeDVisualization mounted.');
});

onUnmounted(() => {
    cleanupThreeJSScene();
});

</script>

<style scoped>
/* Add any specific styles for the 3D visualization container if needed */
</style>