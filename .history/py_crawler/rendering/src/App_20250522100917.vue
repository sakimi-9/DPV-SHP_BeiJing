<template>
  <div>
    <h1>二手房数据可视化</h1>
    <!-- 添加一个 div 作为 Echarts 图表的容器 -->
    <div ref="chartContainer" style="width: 600px; height: 400px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  // 加载数据
  try {
    const response = await fetch('/house_data.json');
    const houseData = await response.json();

    // 简单的数据处理：按所在区域统计房源数量
    const areaCounts: { [key: string]: number } = {};
    houseData.forEach((item: any) => {
      const area = item['所在区域'].split('  ')[1]; // 提取区域信息
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    const areas = Object.keys(areaCounts);
    const counts = Object.values(areaCounts);

    // 使用 Echarts 绘制柱状图示例
    if (chartContainer.value) {
      const myChart = echarts.init(chartContainer.value);
      const option = {
        title: {
          text: '各区域房源数量统计'
        },
        tooltip: {},
        xAxis: {
          data: areas,
          axisLabel: { // 旋转 x 轴标签，避免重叠
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {},
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

  } catch (error) {
    console.error('加载或处理数据时发生错误:', error);
  }
});

</script>

<style scoped>
/* 组件样式 */
</style>