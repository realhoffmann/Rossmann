<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{
  data: RossmannRow[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const daily = new Map<string, { sales: number; customers: number }>();
  props.data.forEach((row) => {
    const key = row.Date.toISOString().slice(0, 10);
    if (!daily.has(key)) daily.set(key, { sales: 0, customers: 0 });
    const agg = daily.get(key)!;
    agg.sales += row.Sales;
    agg.customers += row.Customers;
  });
  const dates = Array.from(daily.keys()).sort();
  const salesTrace = {
    x: dates,
    y: dates.map((d) => daily.get(d)!.sales),
    type: 'scatter',
    mode: 'lines',
    name: 'Sales',
    line: { color: '#2563eb', width: 2 },
    fill: 'tozeroy',
    fillcolor: 'rgba(37, 99, 235, 0.08)',
  };
  const customersTrace = {
    x: dates,
    y: dates.map((d) => daily.get(d)!.customers),
    type: 'scatter',
    mode: 'lines',
    name: 'Customers',
    line: { color: '#f97316', width: 2 },
    yaxis: 'y2',
  };
  const layout = buildLayout('Sales & Customers Timeline', undefined, {
    yaxis: { title: { text: 'Sales' }, gridcolor: '#e5e7eb' },
    yaxis2: { title: { text: 'Customers' }, overlaying: 'y', side: 'right', showgrid: false },
    legend: { orientation: 'h' },
  });
  Plotly.react(chartRef.value, [salesTrace, customersTrace], layout, { displayModeBar: false, responsive: true });
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

