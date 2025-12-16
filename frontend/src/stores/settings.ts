import { defineStore } from 'pinia';

type DatasetMode = 'sample' | 'full' | '';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    datasetMode: '' as DatasetMode,
  }),
  persist: true,
  actions: {
    setMode(mode: DatasetMode) {
      this.datasetMode = mode;
    },
  },
});

