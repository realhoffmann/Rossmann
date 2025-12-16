<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useRossmannData } from '../composables/useRossmannData';
import GlobalFiltersBar from '../components/GlobalFiltersBar.vue';
import StatsBar from '../components/StatsBar.vue';
import TimelineChart from '../components/charts/TimelineChart.vue';
import StoreTypeChart from '../components/charts/StoreTypeChart.vue';
import StateChart from '../components/charts/StateChart.vue';
import DayOfWeekChart from '../components/charts/DayOfWeekChart.vue';
import PromoChart from '../components/charts/PromoChart.vue';
import ScatterChart from '../components/charts/ScatterChart.vue';

const router = useRouter();
const settings = useSettingsStore();
const {
  rows,
  filteredRows,
  stats,
  loading,
  progress,
  errorMessage,
  storeQuery,
  selectedStates,
  selectedStoreTypes,
  selectedAssortments,
  selectedDays,
  dateRange,
  openOnly,
  promoOnly,
  onlySchoolHoliday,
  stateOptions,
  storeTypeOptions,
  assortmentOptions,
  dayOptions,
  activeFilters,
  fastMode,
  clearFilters,
  loadData,
  formatCurrency,
  formatNumber,
} = useRossmannData();

const timelineYear = ref<number | 'all'>('all');
const stateLimit = ref(10);
const scatterLimit = ref(8000);
const storeTypePromoOnly = ref(false);
const dowOpenOnly = ref(false);
const menuItems = [
  { label: 'Global', icon: 'pi pi-home', target: 'global' },
  { label: 'Sales', icon: 'pi pi-chart-line', target: 'sales' },
  { label: 'Types', icon: 'pi pi-sitemap', target: 'types' },
  { label: 'Customers', icon: 'pi pi-users', target: 'customers' },
  { label: 'Promos', icon: 'pi pi-bolt', target: 'promo' },
];

const yearsOptions = computed(() => {
  const years = new Set<number>();
  filteredRows.value.forEach((r) => years.add(r.Date.getFullYear()));
  return ['all', ...Array.from(years).sort()];
});

const timelineRows = computed(() =>
  filteredRows.value.filter((r) => timelineYear.value === 'all' || r.Date.getFullYear() === timelineYear.value),
);

const storeTypeRows = computed(() =>
  storeTypePromoOnly.value ? filteredRows.value.filter((r) => r.Promo) : filteredRows.value,
);

const dowRows = computed(() => (dowOpenOnly.value ? filteredRows.value.filter((r) => r.Open) : filteredRows.value));

const scatterRows = computed(() => filteredRows.value);

onMounted(() => {
  if (!settings.datasetMode) {
    router.push({ name: 'welcome' });
    return;
  }
  loadData(settings.datasetMode === 'full');
});

function goWelcome() {
  router.push({ name: 'welcome' });
}

function reload(mode: 'sample' | 'full') {
  settings.setMode(mode);
  loadData(mode === 'full');
}

function scrollTo(target: string) {
  if (typeof window === 'undefined') return;
  window.document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
}
</script>

<template>
  <div class="layout-shell">
    <Menubar :model="menuItems.map((m) => ({ ...m, command: () => scrollTo(m.target) }))" class="menu-gradient mb-4" />

    <div class="card-surface" id="global" style="margin-bottom: 1rem">
      <div class="flex align-items-center justify-content-between flex-column md:flex-row gap-3">
        <div>
          <p class="pill">
            <i class="pi pi-bolt" />
            Rossmann Insights
          </p>
          <h1 style="margin: 0.25rem 0 0.5rem">Globale Filter + Datenauswahl</h1>
          <p style="margin: 0; color: #475569">
            Global gesteuerte Filter im Header. Je Chart gibt es zusätzliche Mini-Filter für fokussierte Vergleiche.
          </p>
        </div>
        <div class="flex align-items-center gap-3 flex-wrap">
          <Tag severity="success" :value="`${rows.length.toLocaleString()} rows`" />
          <Tag severity="info" :value="`${stateOptions.length} states`" />
          <Tag severity="warning" :value="`${storeTypeOptions.length} store types`" />
          <Tag :severity="fastMode ? 'info' : 'success'" :value="fastMode ? 'Sample aktiv' : 'Full dataset'" />
          <Button label="Datenauswahl ändern" icon="pi pi-arrow-left" text size="small" @click="goWelcome" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2" style="margin-top: 0.75rem">
        <Button label="Sample laden" icon="pi pi-bolt" size="small" @click="reload('sample')" />
        <Button label="Full laden" icon="pi pi-database" size="small" severity="success" outlined @click="reload('full')" />
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

    <div class="grid-gap" style="margin-top: 1rem">
      <StatsBar :stats="stats" :format-currency="formatCurrency" :format-number="formatNumber" />
    </div>

    <div v-if="loading" class="card-surface" style="margin-top: 1rem">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-spin pi-spinner" />
        <strong>Loading processed train_clean.csv ...</strong>
      </div>
      <ProgressBar :value="progress" style="margin-top: 0.5rem" />
      <p style="margin: 0.25rem 0 0; color: #64748b">Bitte Tab geöffnet lassen. Sample = sehr schnell, Full benötigt mehr Zeit.</p>
    </div>

    <div v-if="errorMessage" class="card-surface" style="margin-top: 1rem; border: 1px solid #fecdd3">
      <div class="flex align-items-center gap-2" style="color: #b91c1c">
        <i class="pi pi-exclamation-triangle" />
        <strong>{{ errorMessage }}</strong>
      </div>
    </div>

    <div v-if="!loading && filteredRows.length" class="grid-gap" style="margin-top: 1rem">
      <Panel id="sales" toggleable :collapsed="false">
        <template #header>
          <div class="panel-header">
            <i class="pi pi-chart-line" />
            Sales & Timeline
          </div>
        </template>
        <div class="flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <p class="stat-label" style="margin: 0">Beschreibung</p>
            <p style="margin: 0; color: #475569">
              Tägliche Sales & Customers. Nutze Jahresfilter für saisonale Vergleiche.
            </p>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="stat-label">Jahr</span>
            <Select v-model="timelineYear" :options="yearsOptions" class="w-12rem" placeholder="Alle" />
          </div>
        </div>
        <TimelineChart :data="timelineRows" />
      </Panel>

      <Panel id="types" toggleable :collapsed="false">
        <template #header>
          <div class="panel-header">
            <i class="pi pi-sitemap" />
            Store Types & States
          </div>
        </template>
        <div class="grid-gap">
          <div class="card-surface">
            <div class="flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <p class="stat-label" style="margin: 0">Store Type Chart</p>
                <p style="margin: 0; color: #475569">Optional nur Stores mit Promo berücksichtigen.</p>
              </div>
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="storeTypePromoOnly" binary input-id="promoFilter" />
                <label for="promoFilter" class="stat-label">Nur Promo</label>
              </div>
            </div>
            <StoreTypeChart :data="storeTypeRows" />
          </div>
          <div class="card-surface">
            <div class="flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <p class="stat-label" style="margin: 0">State Ranking</p>
                <p style="margin: 0; color: #475569">Begrenze die Anzahl der Top-States.</p>
              </div>
              <div class="flex align-items-center gap-2">
                <span class="stat-label">Top N</span>
                <Select v-model="stateLimit" :options="[5, 10, 15, 20]" class="w-8rem" />
              </div>
            </div>
            <StateChart :data="filteredRows" :limit="stateLimit" />
          </div>
        </div>
      </Panel>

      <Panel id="customers" toggleable :collapsed="false">
        <template #header>
          <div class="panel-header">
            <i class="pi pi-users" />
            Customer Dynamics
          </div>
        </template>
        <div class="grid-gap">
          <div class="card-surface">
            <div class="flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <p class="stat-label" style="margin: 0">Sales by Day of Week</p>
                <p style="margin: 0; color: #475569">Optional nur offene Tage betrachten.</p>
              </div>
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="dowOpenOnly" binary input-id="dowOpen" />
                <label for="dowOpen" class="stat-label">Nur offene</label>
              </div>
            </div>
            <DayOfWeekChart :data="dowRows" />
          </div>
          <div class="card-surface">
            <div class="flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <p class="stat-label" style="margin: 0">Customers vs Sales</p>
                <p style="margin: 0; color: #475569">Passe die Stichprobengröße für schnelle Renderings an.</p>
              </div>
              <div class="flex align-items-center gap-2">
                <span class="stat-label">Sample</span>
                <Select v-model="scatterLimit" :options="[4000, 8000, 12000, 20000]" class="w-8rem" />
              </div>
            </div>
            <ScatterChart :data="scatterRows" :limit="scatterLimit" />
          </div>
        </div>
      </Panel>

      <Panel id="promo" toggleable :collapsed="false">
        <template #header>
          <div class="panel-header">
            <i class="pi pi-bolt" />
            Promotions & Open Status
          </div>
        </template>
        <p style="margin: 0 0 0.5rem; color: #475569">
          Gegenüberstellung von Promo/Non-Promo und Open/Closed auf Basis der gefilterten Daten.
        </p>
        <PromoChart :data="filteredRows" />
      </Panel>
    </div>
  </div>
</template>

