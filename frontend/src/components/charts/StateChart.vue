<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{ data: RossmannRow[]; limit?: number }>();
const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const agg = new Map<string, { sum: number; count: number }>();
  props.data.forEach((row) => {
    const key = row.State;
    if (!agg.has(key)) agg.set(key, { sum: 0, count: 0 });
    const item = agg.get(key)!;
    item.sum += row.Sales;
    item.count += 1;
  });
  const limit = props.limit ?? 12;
  const pairs = Array.from(agg.entries())
    .map(([state, { sum, count }]) => ({ state, mean: sum / Math.max(1, count) }))
    .sort((a, b) => b.mean - a.mean)
    .slice(0, limit);
  const trace = {
    x: pairs.map((p) => p.state),
    y: pairs.map((p) => p.mean),
    type: 'bar',
    marker: { color: '#8b5cf6' },
  };
  Plotly.react(
    chartRef.value,
    [trace],
    buildLayout('Top States by Mean Sales', 'Sales', { xaxis: { automargin: true } }),
    { displayModeBar: false, responsive: true },
  );
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

