<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { RossmannRow } from '../../types';
import { buildLayout } from '../../utils/chartLayout';

const props = defineProps<{ data: RossmannRow[] }>();
const chartRef = ref<HTMLDivElement | null>(null);

function render() {
  if (!chartRef.value || !props.data.length) return;
  const groups = {
    Open: props.data.filter((r) => r.Open),
    Closed: props.data.filter((r) => !r.Open),
    Promo: props.data.filter((r) => r.Promo),
    'No Promo': props.data.filter((r) => !r.Promo),
  };
  const trace = {
    x: Object.keys(groups),
    y: Object.values(groups).map((group) =>
      group.length ? group.reduce((sum, r) => sum + r.Sales, 0) / group.length : 0,
    ),
    type: 'bar',
    marker: { color: ['#22c55e', '#f43f5e', '#f59e0b', '#cbd5e1'] },
  };
  Plotly.react(chartRef.value, [trace], buildLayout('Promo & Open Impact on Sales', 'Sales'), {
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

