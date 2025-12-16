<script setup lang="ts">
import type { StatsSummary } from '../types';

defineProps<{
  stats: StatsSummary;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}>();
</script>

<template>
  <div class="card-surface">
    <div class="grid grid-nogutter">
      <div class="col-12 md:col-3 stat-card">
        <span class="stat-label">Rows after filters</span>
        <span class="stat-value">{{ stats.rows.toLocaleString() }}</span>
      </div>
      <div class="col-12 md:col-3 stat-card">
        <span class="stat-label">Stores</span>
        <span class="stat-value">{{ stats.stores.toLocaleString() }}</span>
      </div>
      <div class="col-12 md:col-3 stat-card">
        <span class="stat-label">Avg Sales</span>
        <span class="stat-value">{{ formatCurrency(stats.avgSales) }}</span>
      </div>
      <div class="col-12 md:col-3 stat-card">
        <span class="stat-label">Avg Customers</span>
        <span class="stat-value">{{ formatNumber(stats.avgCustomers) }}</span>
      </div>
    </div>
  </div>
</template>

