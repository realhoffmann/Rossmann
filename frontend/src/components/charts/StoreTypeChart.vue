<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{ data: RossmannRow[] }>();
const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const agg = new Map<string, { sum: number; count: number }>();
  props.data.forEach((row) => {
    const key = row.StoreType;
    if (!agg.has(key)) agg.set(key, { sum: 0, count: 0 });
    const item = agg.get(key)!;
    item.sum += row.Sales;
    item.count += 1;
  });
  const keys = Array.from(agg.keys()).sort();
  const values = keys.map((k) => agg.get(k)!.sum / Math.max(1, agg.get(k)!.count));
  const trace = {
    x: keys.map((k) => `Type ${k.toUpperCase()}`),
    y: values,
    type: 'bar',
    marker: { color: '#22c55e' },
  };
  Plotly.react(chartRef.value, [trace], buildLayout('Mean Sales by Store Type', 'Sales'), {
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

