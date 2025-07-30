<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { parseHouseData, ParsedHouse } from './dataParser';
import HouseData2DCharts from './HouseData2DCharts.vue';
import HouseData3DScene from './HouseData3DScene.vue'; // 导入 3D 场景组件

const houseData = ref<ParsedHouse[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// ... existing code ...

const fetchData = async () => {
    try {
        const response = await fetch('/house_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        houseData.value = parseHouseData(jsonData);
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message;
        } else {
            error.value = 'An unknown error occurred';
        }
        console.error('Error fetching or parsing data:', e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div>
        <h1>上海链家二手房数据可视化</h1>

        <div v-if="loading">
            <p>加载数据中...</p>
        </div>

        <div v-else-if="error">
            <p>加载数据失败: {{ error }}</p>
        </div>

        <div v-else>
            <!-- 2D 图表 -->
            <HouseData2DCharts :houseData="houseData" />

            <!-- 3D 场景 -->
            <HouseData3DScene :houseData="houseData" />
        </div>
    </div>
</template>

<style>
/* 可以添加一些全局样式 */
body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>