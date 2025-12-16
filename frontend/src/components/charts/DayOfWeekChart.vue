<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{ data: RossmannRow[] }>();
const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const agg = new Map<number, { sum: number; count: number }>();
  props.data.forEach((row) => {
    if (!agg.has(row.DayOfWeek)) agg.set(row.DayOfWeek, { sum: 0, count: 0 });
    const item = agg.get(row.DayOfWeek)!;
    item.sum += row.Sales;
    item.count += 1;
  });
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  const trace = {
    x: days.map((d) => `Day ${d}`),
    y: days.map((d) => {
      const entry = agg.get(d);
      if (!entry) return 0;
      return entry.sum / Math.max(1, entry.count);
    }),
    type: 'bar',
    marker: { color: '#0ea5e9' },
  };
  Plotly.react(chartRef.value, [trace], buildLayout('Mean Sales by Day of Week', 'Sales'), {
    displayModeBar: false,
    responsive: true,
  });
}

onMounted(render);
watch(
  () => props.data,
  () => render(),
  { deep: true },
);
</script>

<template>
  <div ref="chartRef" class="chart" />
</template>

