<script setup lang="ts">
import GlobalFiltersBar from '../components/GlobalFiltersBar.vue';
import PromoChart from '../components/charts/PromoChart.vue';
import {useRossmannData} from '../composables/useRossmannData';

const menuItems = [
  {label: 'Overview', icon: 'pi pi-home', command: () => (window.location.hash = '#/overview')},
  {label: 'Sales', icon: 'pi pi-chart-line', command: () => (window.location.hash = '#/sales')},
  {label: 'Promo', icon: 'pi pi-bolt', command: () => (window.location.hash = '#/promo')},
  {label: 'Store types', icon: 'pi pi-sitemap', command: () => (window.location.hash = '#/store-types')},
];

const {
  filteredRows,
  dateRange,
  storeQuery,
  selectedStates,
  selectedStoreTypes,
  selectedAssortments,
  selectedDays,
  openOnly,
  promoOnly,
  onlySchoolHoliday,
  stateOptions,
  storeTypeOptions,
  assortmentOptions,
  dayOptions,
  activeFilters,
  clearFilters,
  dataReady
} = useRossmannData();
</script>

<template>
  <div class="layout-shell">
    <Menubar :model="menuItems" class="menu-gradient mb-4"/>
    <div class="card-surface" style="margin-bottom: 1rem">
      <div class="flex align-items-center justify-content-between flex-column md:flex-row gap-3">
        <div>
          <p class="pill">
            <i class="pi pi-bolt"/>
            Rossmann Insights
          </p>
          <h1 style="margin: 0.25rem 0 0.5rem">Promo</h1>
        </div>
      </div>
    </div>

    <GlobalFiltersBar
        v-model:store-query="storeQuery"
        v-model:selected-states="selectedStates"
        v-model:selected-store-types="selectedStoreTypes"
        v-model:selected-assortments="selectedAssortments"
        v-model:selected-days="selectedDays"
        v-model:date-range="dateRange"
        v-model:open-only="openOnly"
        v-model:promo-only="promoOnly"
        v-model:only-school-holiday="onlySchoolHoliday"
        :state-options="stateOptions"
        :store-type-options="storeTypeOptions"
        :assortment-options="assortmentOptions"
        :day-options="dayOptions"
        :active-filters="activeFilters"
        :on-reset="clearFilters"
    />

    <div v-if="dataReady" class="grid-gap" style="margin-top: 1rem">
      <div class="card-surface">
        <h3>Promotions</h3>
        <PromoChart :data="filteredRows"/>
      </div>
    </div>

    <div v-else class="card-surface" style="margin-top: 1rem">
      <p>Keine Daten geladen. Bitte zurück zur Willkommensseite gehen und dort Dataset laden (wird in LocalStorage
        gespeichert).</p>
    </div>
  </div>
</template>
