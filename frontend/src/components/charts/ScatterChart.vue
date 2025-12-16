<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{ data: RossmannRow[]; limit?: number }>();
const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const sample = props.data.slice(0, props.limit ?? 12000);
  const trace = {
    x: sample.map((r) => r.Customers),
    y: sample.map((r) => r.Sales),
    mode: 'markers',
    type: 'scatter',
    marker: { color: '#2563eb', opacity: 0.45, size: 6 },
  };
  Plotly.react(
    chartRef.value,
    [trace],
    buildLayout('Customers vs Sales', 'Sales', {
      xaxis: { title: { text: 'Customers' }, gridcolor: '#e5e7eb' },
    }),
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

