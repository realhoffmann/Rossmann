<script setup lang="ts">
import {ref, watch} from 'vue';
import type {SelectOption} from '../types';

const storeQuery = defineModel<string>('storeQuery', {required: true});
const selectedStates = defineModel<string[]>('selectedStates', {required: true});
const selectedStoreTypes = defineModel<string[]>('selectedStoreTypes', {required: true});
const selectedAssortments = defineModel<string[]>('selectedAssortments', {required: true});
const selectedDays = defineModel<number[]>('selectedDays', {required: true});
const dateRange = defineModel<[Date | null, Date | null]>('dateRange', {required: true});
const openOnly = defineModel<boolean>('openOnly', {required: true});
const promoOnly = defineModel<boolean>('promoOnly', {required: true});
const onlySchoolHoliday = defineModel<boolean>('onlySchoolHoliday', {required: true});

const props = defineProps<{
  stateOptions: SelectOption[];
  storeTypeOptions: SelectOption[];
  assortmentOptions: SelectOption[];
  dayOptions: SelectOption[];
  activeFilters: string[];
  onReset: () => void;
}>();

const pickerValue = ref<[Date, Date] | null>(null);

const initParent = dateRange as unknown as { value: [Date | null, Date | null] };
if (initParent && Array.isArray(initParent.value)) {
  const [s, e] = initParent.value;
  pickerValue.value = [s ?? new Date(), e ?? new Date()];
} else {
  pickerValue.value = [new Date(), new Date()];
}

watch(
    () => (dateRange as unknown as { value: [Date | null, Date | null] }).value,
    (val) => {
      if (!val) {
        pickerValue.value = [new Date(), new Date()];
        return;
      }
      const [s, e] = val;
      pickerValue.value = [s ?? new Date(), e ?? new Date()];
    },
    {deep: true},
);

watch(
    pickerValue,
    (val) => {
      const cur = dateRange as unknown as { value: [Date | null, Date | null] };
      if (!val) {
        cur.value = [null, null];
        return;
      }
      cur.value = [val[0] ?? null, val[1] ?? null];
    },
    {deep: true},
);
</script>

<template>
  <div class="card-surface" style="position: sticky; top: 0; z-index: 10">
    <div class="flex align-items-center gap-3 flex-wrap">
      <div class="panel-header">
        <i class="pi pi-filter"/>
        Globale Filter
      </div>
      <Button label="Reset" icon="pi pi-refresh" size="small" severity="secondary" @click="props.onReset"/>
    </div>
    <div class="filters-grid" style="margin-top: 0.75rem">
      <div>
        <label class="stat-label">Store IDs</label>
        <InputText v-model="storeQuery" placeholder="1, 23, 77" class="w-full"/>
        <small style="color: #94a3b8">Comma/space getrennt</small>
      </div>
      <div>
        <label class="stat-label">States</label>
        <MultiSelect
            v-model="selectedStates"
            display="chip"
            :options="props.stateOptions"
            option-label="label"
            option-value="value"
            placeholder="States"
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
            placeholder="Types"
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
            placeholder="Assortments"
            class="w-full"
        />
      </div>
      <div>
        <label class="stat-label">Days</label>
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
        <!-- bind the internal pickerValue to the DatePicker -->
        <DatePicker v-model="pickerValue" selectionMode="range" showIcon class="w-full" dateFormat="yy-mm-dd"/>
      </div>
      <div class="flex gap-3 flex-wrap" style="align-self: flex-end">
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="openOnly" binary input-id="openOnly"/>
          <label for="openOnly" class="stat-label">Nur offene</label>
        </div>
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="promoOnly" binary input-id="promoOnly"/>
          <label for="promoOnly" class="stat-label">Nur Promo</label>
        </div>
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="onlySchoolHoliday" binary input-id="schoolHoliday"/>
          <label for="schoolHoliday" class="stat-label">Nur Schulferien</label>
        </div>
      </div>
    </div>
    <Divider/>
    <div class="flex flex-wrap gap-2">
      <Tag v-for="filter in props.activeFilters" :key="filter" severity="info" :value="filter"/>
      <Tag v-if="!props.activeFilters.length" value="Keine globalen Filter" severity="secondary"/>
    </div>
  </div>
</template>
