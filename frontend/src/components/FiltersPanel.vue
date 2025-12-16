<script setup lang="ts">
import {computed} from 'vue';
import type {Limits, SelectOption} from '../types';

const storeQuery = defineModel<string>('storeQuery', {required: true});
const selectedStates = defineModel<string[]>('selectedStates', {required: true});
const selectedStoreTypes = defineModel<string[]>('selectedStoreTypes', {required: true});
const selectedAssortments = defineModel<string[]>('selectedAssortments', {required: true});
const selectedDays = defineModel<number[]>('selectedDays', {required: true});
const dateRange = defineModel<[Date | null, Date | null]>('dateRange', {required: true});
const salesRange = defineModel<[number, number]>('salesRange', {required: true});
const customersRange = defineModel<[number, number]>('customersRange', {required: true});
const openOnly = defineModel<boolean>('openOnly', {required: true});
const promoOnly = defineModel<boolean>('promoOnly', {required: true});
const onlySchoolHoliday = defineModel<boolean>('onlySchoolHoliday', {required: true});

const props = defineProps<{
  limits: Limits;
  stateOptions: SelectOption[];
  storeTypeOptions: SelectOption[];
  assortmentOptions: SelectOption[];
  dayOptions: SelectOption[];
  activeFilters: string[];
  onReset: () => void;
  salesStep: number;
  customersStep: number;
  slidersReady: boolean;
  dataReady: boolean;
}>();

const salesMin = computed(() => (Number.isFinite(props.limits.salesMin) ? props.limits.salesMin : 0));
const salesMax = computed(() => (Number.isFinite(props.limits.salesMax) ? props.limits.salesMax : 0));
const customersMin = computed(() => (Number.isFinite(props.limits.customersMin) ? props.limits.customersMin : 0));
const customersMax = computed(() => (Number.isFinite(props.limits.customersMax) ? props.limits.customersMax : 0));
const sliderDisabled = computed(
    () =>
        !props.slidersReady ||
        !props.dataReady ||
        salesMax.value <= salesMin.value ||
        customersMax.value <= customersMin.value,
);
</script>

<template>
  <Panel toggleable :collapsed="false">
    <template #header>
      <div class="panel-header">
        <i class="pi pi-filter"/>
        Filter controls
      </div>
    </template>
    <div class="filters-grid">
      <div>
        <label class="stat-label">Store IDs</label>
        <InputText v-model="storeQuery" placeholder="e.g. 1, 23, 77" class="w-full"/>
        <small style="color: #94a3b8">Comma/space separated list</small>
      </div>
      <div>
        <label class="stat-label">States</label>
        <MultiSelect
            v-model="selectedStates"
            display="chip"
            :options="props.stateOptions"
            option-label="label"
            option-value="value"
            placeholder="Select states"
            class="w-full"
        />
      </div>
      <div>
        <label class="stat-label">Store Types</label>
        <MultiSelect
            v-model="selectedStoreTypes"
            display="chip"
            :options="props.storeTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select types"
            class="w-full"
        />
      </div>
      <div>
        <label class="stat-label">Assortments</label>
        <MultiSelect
            v-model="selectedAssortments"
            display="chip"
            :options="props.assortmentOptions"
            option-label="label"
            option-value="value"
            placeholder="Select assortments"
            class="w-full"
        />
      </div>
      <div>
        <label class="stat-label">Day of week</label>
        <MultiSelect
            v-model="selectedDays"
            display="chip"
            :options="props.dayOptions"
            option-label="label"
            option-value="value"
            placeholder="Days"
            class="w-full"
        />
      </div>
      <div>
        <label class="stat-label">Date range</label>
        <DatePicker v-model="dateRange" selectionMode="range" showIcon class="w-full" dateFormat="yy-mm-dd"/>
      </div>
      <div>
        <label class="stat-label">
          Sales range
          <span style="float: right; color: #0f172a; font-weight: 700">
            {{ new Intl.NumberFormat('en-US').format(salesRange[0]) }} -
            {{ new Intl.NumberFormat('en-US').format(salesRange[1]) }}
          </span>
        </label>
        <Slider
            v-model="salesRange"
            range
            :min="salesMin"
            :max="salesMax"
            :step="props.salesStep"
            class="w-full"
            :disabled="sliderDisabled"
        />
      </div>
      <div>
        <label class="stat-label">
          Customers range
          <span style="float: right; color: #0f172a; font-weight: 700">
            {{ new Intl.NumberFormat('en-US').format(customersRange[0]) }} -
            {{ new Intl.NumberFormat('en-US').format(customersRange[1]) }}
          </span>
        </label>
        <Slider
            v-model="customersRange"
            range
            :min="customersMin"
            :max="customersMax"
            :step="props.customersStep"
            class="w-full"
            :disabled="sliderDisabled"
        />
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mt-3">
      <div class="flex align-items-center gap-2">
        <Checkbox v-model="openOnly" binary input-id="openOnly"/>
        <label for="openOnly" class="stat-label">Open stores only</label>
      </div>
      <div class="flex align-items-center gap-2">
        <Checkbox v-model="promoOnly" binary input-id="promoOnly"/>
        <label for="promoOnly" class="stat-label">Promo only</label>
      </div>
      <div class="flex align-items-center gap-2">
        <Checkbox v-model="onlySchoolHoliday" binary input-id="schoolHoliday"/>
        <label for="schoolHoliday" class="stat-label">School holiday only</label>
      </div>
      <span class="flex-grow-1"/>
      <Button label="Reset filters" icon="pi pi-refresh" severity="secondary" @click="props.onReset"/>
    </div>
    <Divider/>
    <div class="flex flex-wrap gap-2">
      <Tag v-for="filter in props.activeFilters" :key="filter" severity="info" :value="filter"/>
      <Tag v-if="!props.activeFilters.length" value="No active filters" severity="secondary"/>
    </div>
  </Panel>
</template>

