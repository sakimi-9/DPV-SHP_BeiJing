<template>
  <div>
    <h1>二手房数据可视化</h1>

    <!-- 模式切换 UI -->
    <div>
      <button @click="currentMode = '2D'" :disabled="currentMode === '2D'">2D 模式</button>
      <button @click="currentMode = '3D'" :disabled="currentMode === '3D'">3D 模式</button>
    </div>

    <!-- 2D 图表区域 -->
    <div v-if="currentMode === '2D'" class="charts-2d-container">
      <h2>2D 图表</h2>

      <!-- 各区域房源数量统计 和 单价分布直方图 -->
      <div class="chart-row">
        <div class="chart-item">
          <h3>各区域房源数量统计</h3>
          <div ref="areaChartContainer" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="chart-item">
          <h3>单价分布</h3>
          <div ref="priceHistContainer" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

      <!-- 面积分布直方图 和 户型统计 -->
      <div class="chart-row">
        <div class="chart-item">
          <h3>面积分布</h3>
          <div ref="areaHistContainer" style="width: 100%; height: 400px;"></div>
        </div>
        <div class="chart-item">
          <h3>户型统计</h3>
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

    </div>

    <!-- 3D 图表区域 (待实现) -->
    <div v-if="currentMode === '3D'">
      <h2>3D 图表</h2>
      <!-- Three.js 3D 可视化将在这里实现 -->
      <p>3D 可视化功能待开发...</p>
      <div ref="threeContainer" style="width: 800px; height: 500px; border: 1px solid #ccc;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">



</script>
<script src="./DataParsing.ts"></script>
<script src="./ChartImplement.ts"></script>
<style scoped>
/* 组件样式 */
div {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}

.charts-2d-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Add space between rows */
}

.chart-row {
  display: flex;
  gap: 20px;
  /* Add space between charts in a row */
}

.chart-item {
  flex: 1;
  /* Allow chart item to grow and shrink */
  min-width: 0;
  /* Prevent content from overflowing */
}

/* Adjust chart div width */
.chart-item>div {
  width: 100%;
}
</style>