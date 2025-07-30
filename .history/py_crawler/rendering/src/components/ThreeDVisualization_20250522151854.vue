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
// const MIN_LAT = 39.0; // Adjusted for Beijing
// const MAX_LAT = 42.0; // Adjusted for Beijing
// const MIN_LNG = 115.0; // Adjusted for Beijing
// const MAX_LNG = 118.0; // Adjusted for Beijing
const PLANE_WIDTH = 750; // Adjusted size
const PLANE_HEIGHT = 750; // Adjusted size

// Variables to store actual data bounds
let actualMinLat: number | null = null;
let actualMaxLat: number | null = null;
let actualMinLng: number | null = null;
let actualMaxLng: number | null = null;

function latLonToVector3(lat: number, lon: number): THREE.Vector3 {
    // Use actual data bounds for mapping if available, otherwise use a default/北京范围
    const minLat = actualMinLat !== null ? actualMinLat : 39.0; // Default Beijing min lat
    const maxLat = actualMaxLat !== null ? actualMaxLat : 42.0; // Default Beijing max lat
    const minLng = actualMinLng !== null ? actualMinLng : 115.0; // Default Beijing min lng
    const maxLng = actualMaxLng !== null ? actualMaxLng : 118.0; // Default Beijing max lng

    // Ensure ranges are valid to avoid division by zero or extreme scaling
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    let x = 0;
    let z = 0;

    if (lngRange > 0) {
        x = ((lon - minLng) / lngRange) * PLANE_WIDTH - PLANE_WIDTH / 2;
    }

    if (latRange > 0) {
        // Use latitude for the z-axis in Three.js (assuming a standard map orientation)
        // Invert latitude mapping if needed depending on desired orientation
        // We want higher latitude (more north) to be higher on the Z axis (further away)
        // Three.js Z+ is typically forward, Z- is backward. Y+ is up.
        // A standard map has North up, so higher lat should map to larger Z.
        // The current mapping already does this correctly if MAX_LAT > MIN_LAT
        z = ((lat - minLat) / latRange) * PLANE_HEIGHT - PLANE_HEIGHT / 2;
    }

    // Assuming y is height (0 for the base plane)
    return new THREE.Vector3(x, 0, z);
}

// Function to setup the Three.js scene with data visualization
const setupThreeJSScene = (container: HTMLElement, data: ParsedHouse[]) => {
    console.log('setupThreeJSScene called.');

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

    // Calculate actual data bounds
    if (aggregatedData.length > 0) {
        actualMinLat = Math.min(...aggregatedData.map(item => item.location.lat));
        actualMaxLat = Math.max(...aggregatedData.map(item => item.location.lat));
        actualMinLng = Math.min(...aggregatedData.map(item => item.location.lng));
        actualMaxLng = Math.max(...aggregatedData.map(item => item.location.lng));

        // *** DEBUG LOG ***
        console.log(`Actual Data Bounds: Lat [${actualMinLat.toFixed(4)}, ${actualMaxLat.toFixed(4)}], Lng [${actualMinLng.toFixed(4)}, ${actualMaxLng.toFixed(4)}]`);
        // *****************

        // Adjust PLANE_WIDTH/HEIGHT slightly if the actual range is very narrow
        const actualLatRange = actualMaxLat - actualMinLat;
        const actualLngRange = actualMaxLng - actualMinLng;
        const aspectRatio = actualLngRange > 0 ? actualLatRange / actualLngRange : 1;

        // Maintain aspect ratio but ensure a minimum size to prevent extreme scaling
        const baseSize = 750;
        if (aspectRatio > 1) { // Taller than wide
            PLANE_HEIGHT = baseSize;
            PLANE_WIDTH = baseSize / aspectRatio;
        } else { // Wider than tall or square
            PLANE_WIDTH = baseSize;
            PLANE_HEIGHT = baseSize * aspectRatio;
        }

        // Ensure minimum plane size
        PLANE_WIDTH = Math.max(PLANE_WIDTH, 300);
        PLANE_HEIGHT = Math.max(PLANE_HEIGHT, 300);

        // *** DEBUG LOG ***
        console.log(`Adjusted Plane Size: Width ${PLANE_WIDTH.toFixed(2)}, Height ${PLANE_HEIGHT.toFixed(2)}`);
        // *****************
    }

    // Find max count and max average price for scaling
    const maxCount = Math.max(...aggregatedData.map(item => item.count));
    const maxAveragePrice = Math.max(...aggregatedData.map(item => item.average_price));

    // *** DEBUG LOG ***
    console.log(`Max Count: ${maxCount}, Max Average Price: ${maxAveragePrice.toFixed(2)}`);
    // *****************

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    // Position camera for a better view of the map
    // camera.position.set(0, 400, 400); // Example angled view
    // camera.lookAt(0, 0, 0); // Look at the center of the plane
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_LOOKAT);

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
    controls.target.copy(CAMERA_LOOKAT); // Set controls target to the lookAt point

    // 5. Add Base Map Plane
    const groundGeometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc }); // Or load a map texture here
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundPlane.position.y = 0; // Place at the base
    scene!.add(groundPlane);

    // 6. Add Data Visualization Objects (Heatmap Cylinders)
    const maxBarHeight = 300; // Increase max height for visibility

    // Define a color scale for average price (e.g., blue to red)
    const colorScale = (price: number) => {
        const ratio = maxAveragePrice > 0 ? (price / maxAveragePrice) : 0;
        // Interpolate between blue (low price) and red (high price) - can adjust color range
        const color = new THREE.Color(0x0000ff).lerp(new THREE.Color(0xff0000), ratio);
        return color;
    };

    // More distinct color scale (Blue -> Green -> Yellow -> Red)
    const distinctColorScale = (price: number) => {
        const ratio = maxAveragePrice > 0 ? (price / maxAveragePrice) : 0;
        const color = new THREE.Color();
        if (ratio < 0.25) {
            color.lerpColors(new THREE.Color(0x0000ff), new THREE.Color(0x00ff00), ratio / 0.25); // Blue to Green
        } else if (ratio < 0.75) {
            color.lerpColors(new THREE.Color(0x00ff00), new THREE.Color(0xffff00), (ratio - 0.25) / 0.5); // Green to Yellow
        } else {
            color.lerpColors(new THREE.Color(0xffff00), new THREE.Color(0xff0000), (ratio - 0.75) / 0.25); // Yellow to Red
        }
        return color;
    };

    const barRadius = 8; // Increase cylinder radius

    // Create info box for hover
    const infoBox = document.createElement('div');
    infoBox.style.position = 'absolute';
    infoBox.style.top = '10px';
    infoBox.style.left = '10px';
    infoBox.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    infoBox.style.padding = '10px';
    infoBox.style.border = '1px solid #ccc';
    infoBox.style.pointerEvents = 'none'; // Don't block mouse events
    infoBox.style.display = 'none'; // Hide initially
    container.appendChild(infoBox);

    // Mouse and Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let intersectedObject: THREE.Object3D | null = null;

    // Add mousemove listener to the container
    container.addEventListener('mousemove', (event) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    aggregatedData.forEach(item => {
        // Calculate position based on lat/lon
        const position = latLonToVector3(item.location.lat, item.location.lng);

        // Calculate height based on count (using square root scale)
        const height = maxCount > 0 ? (Math.sqrt(item.count) / Math.sqrt(maxCount)) * maxBarHeight + 1 : 1; // Use square root scale

        // Create a cylinder for the location
        const geometry = new THREE.CylinderGeometry(barRadius, barRadius, height, 16); // Use adjustable radius
        const material = new THREE.MeshPhongMaterial({ color: distinctColorScale(item.average_price) });

        const cylinder = new THREE.Mesh(geometry, material);

        // Position the cylinder at the base of its height
        cylinder.position.set(position.x, height / 2, position.z);

        // Store data for potential interaction
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

        // Update the picking ray with the camera and mouse position
        if (camera) {
            raycaster.setFromCamera(mouse, camera);

            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(scene!.children, true); // Check all children

            if (intersects.length > 0) {
                // Find the first intersected object that has locationData (i.e., a cylinder)
                const intersected = intersects.find(intersect => (intersect.object as any).userData && (intersect.object as any).userData.locationData);

                if (intersected) {
                    const object = intersected.object;

                    if (intersectedObject !== object) {
                        // Previously hovered object
                        if (intersectedObject) {
                            // You could change color back here if needed
                        }
                        // New hovered object
                        intersectedObject = object;

                        // Display info box
                        const data = (object as any).userData.locationData;
                        infoBox.innerHTML = `<b>区域:</b> ${data.name}<br><b>房源数量:</b> ${data.count}<br><b>平均单价:</b> ${data.average_price.toFixed(2)}元/平`;
                        infoBox.style.display = 'block';

                        // Optional: Position info box near the object (more complex)
                        // For simplicity, keeping it fixed for now.

                        // Optional: Change color of hovered object
                        // (object as THREE.Mesh).material.emissive.setHex(0xff0000);
                    }
                } else {
                    // If no hoverable object is intersected but there was a previously hovered object
                    if (intersectedObject) {
                        // Reset color
                        // (intersectedObject as THREE.Mesh).material.emissive.setHex(0x000000);
                    }
                    intersectedObject = null;
                    infoBox.style.display = 'none'; // Hide info box
                }
            } else {
                // If nothing is intersected but there was a previously hovered object
                if (intersectedObject) {
                    // Reset color
                    // (intersectedObject as THREE.Mesh).material.emissive.setHex(0x000000);
                }
                intersectedObject = null;
                infoBox.style.display = 'none'; // Hide info box
            }
        }

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
        // Remove mousemove listener
        if (threeContainer.value) {
            threeContainer.value.removeEventListener('mousemove', (event) => {
                // Calculate mouse position in normalized device coordinates (-1 to +1)
                const rect = threeContainer.value!.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            });
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
    // Remove info box on cleanup
    if (container && container.contains(infoBox)) {
        container.removeChild(infoBox);
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
        console.log('houseData updated, attempting to setup 3D map heatmap scene.');
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