import {computed, ref} from 'vue';
import Papa from 'papaparse';
import type {Limits, RossmannRow, SelectOption, StatsSummary} from '../types';

function createRossmannData() {
    const dataUrl = new URL(`${import.meta.env.BASE_URL}data/train_clean.csv`, window.location.origin).toString();

    const ROWS_KEY = 'rossmann:rows';
    const META_KEY = 'rossmann:meta';

    const rows = ref<RossmannRow[]>([]);
    const totalRows = ref(0);
    const loading = ref(false);
    const progress = ref(0);
    const errorMessage = ref('');

    const fastMode = ref(true);
    // default sample limit: 25_000 per request
    const sampleLimit = ref<number | null>(25_000);

    const limits = ref<Limits>({
        salesMin: Number.POSITIVE_INFINITY,
        salesMax: 0,
        customersMin: Number.POSITIVE_INFINITY,
        customersMax: 0,
        dateMin: null,
        dateMax: null,
    });

    // helper: update limits for a row
    function updateLimits(row: RossmannRow) {
        limits.value.salesMin = Math.min(limits.value.salesMin, row.Sales);
        limits.value.salesMax = Math.max(limits.value.salesMax, row.Sales);
        limits.value.customersMin = Math.min(limits.value.customersMin, row.Customers);
        limits.value.customersMax = Math.max(limits.value.customersMax, row.Customers);
        if (!limits.value.dateMin || row.Date < limits.value.dateMin) limits.value.dateMin = row.Date;
        if (!limits.value.dateMax || row.Date > limits.value.dateMax) limits.value.dateMax = row.Date;
    }

    function tryRestoreFromLocalStorage(): boolean {
        try {
            const raw = localStorage.getItem(ROWS_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw) as any[];
            if (!Array.isArray(parsed) || parsed.length === 0) return false;
            const restored = parsed
                .map((r) => ({...r, Date: r.Date ? new Date(String(r.Date)) : null}))
                .filter((r) => r.Date !== null) as RossmannRow[];
            if (!restored.length) return false;
            rows.value = restored;
            limits.value = {
                salesMin: Number.POSITIVE_INFINITY,
                salesMax: 0,
                customersMin: Number.POSITIVE_INFINITY,
                customersMax: 0,
                dateMin: null,
                dateMax: null,
            };
            rows.value.forEach((row) => updateLimits(row));
            dateRange.value = [limits.value.dateMin, limits.value.dateMax];
            progress.value = 100;
            return true;
        } catch (err) {
            console.warn('Failed to restore Rossmann data from localStorage', err);
            return false;
        }
    }

    function persistToLocalStorage() {
        try {
            const serial = rows.value.map((r) => ({...r, Date: r.Date ? r.Date.toISOString() : null}));
            localStorage.setItem(ROWS_KEY, JSON.stringify(serial));
            const meta = {mode: fastMode.value ? 'sample' : 'full', rows: rows.value.length, savedAt: Date.now()};
            localStorage.setItem(META_KEY, JSON.stringify(meta));
        } catch (err) {
            console.warn('Failed to persist Rossmann data to localStorage', err);
        }
    }

    const storeQuery = ref('');
    const selectedStates = ref<string[]>([]);
    const selectedStoreTypes = ref<string[]>([]);
    const selectedAssortments = ref<string[]>([]);
    const selectedDays = ref<number[]>([]);
    const dateRange = ref<[Date | null, Date | null]>([new Date(), new Date()]);
    const openOnly = ref(false);
    const promoOnly = ref(false);
    const onlySchoolHoliday = ref(false);

    tryRestoreFromLocalStorage();

    const stateOptions = computed<SelectOption[]>(() =>
        Array.from(new Set(rows.value.map((r) => r.State)))
            .sort()
            .map((state) => ({label: state, value: state})),
    );

    const storeTypeOptions = computed<SelectOption[]>(() =>
        Array.from(new Set(rows.value.map((r) => r.StoreType)))
            .sort()
            .map((type) => ({label: `Type ${type.toUpperCase()}`, value: type})),
    );

    const assortmentOptions = computed<SelectOption[]>(() =>
        Array.from(new Set(rows.value.map((r) => r.Assortment)))
            .sort()
            .map((ass) => ({label: `Assortment ${ass.toUpperCase()}`, value: ass})),
    );

    const dayOptions = computed<SelectOption[]>(() => [1, 2, 3, 4, 5, 6, 7].map((d) => ({
        label: `Day ${d}`,
        value: d
    })));

    const parsedStoreIds = computed<Set<number> | null>(() => {
        const tokens = storeQuery.value
            .split(/[\s,;]+/)
            .map((t) => t.trim())
            .filter(Boolean);
        if (!tokens.length) return null;
        const ids = new Set<number>();
        tokens.forEach((token) => {
            const num = Number(token);
            if (!Number.isNaN(num)) ids.add(num);
        });
        return ids.size ? ids : null;
    });

    const filteredRows = computed<RossmannRow[]>(() => {
        const storesFilter = parsedStoreIds.value;
        const [start, end] = dateRange.value;
        return rows.value.filter((row) => {
            if (storesFilter && !storesFilter.has(row.Store)) return false;
            if (selectedStates.value.length && !selectedStates.value.includes(row.State)) return false;
            if (selectedStoreTypes.value.length && !selectedStoreTypes.value.includes(row.StoreType)) return false;
            if (selectedAssortments.value.length && !selectedAssortments.value.includes(row.Assortment)) return false;
            if (selectedDays.value.length && !selectedDays.value.includes(row.DayOfWeek)) return false;
            if (openOnly.value && !row.Open) return false;
            if (promoOnly.value && !row.Promo) return false;
            if (onlySchoolHoliday.value && !row.SchoolHoliday) return false;
            if (start && row.Date < start) return false;
            return !(end && row.Date > end);

        });
    });

    const stats = computed<StatsSummary>(() => {
        if (!filteredRows.value.length) {
            return {avgSales: 0, avgCustomers: 0, totalSales: 0, stores: 0, rows: 0};
        }
        const totalSales = filteredRows.value.reduce((sum, r) => sum + r.Sales, 0);
        const totalCust = filteredRows.value.reduce((sum, r) => sum + r.Customers, 0);
        return {
            avgSales: totalSales / filteredRows.value.length,
            avgCustomers: totalCust / filteredRows.value.length,
            totalSales,
            stores: new Set(filteredRows.value.map((r) => r.Store)).size,
            rows: filteredRows.value.length,
        };
    });

    const activeFilters = computed(() => {
        const filters: string[] = [];
        if (parsedStoreIds.value) filters.push(`Store IDs (${parsedStoreIds.value.size})`);
        if (selectedStates.value.length) filters.push(`States: ${selectedStates.value.join(', ')}`);
        if (selectedStoreTypes.value.length) filters.push(`Types: ${selectedStoreTypes.value.join(', ')}`);
        if (selectedAssortments.value.length) filters.push(`Assortments: ${selectedAssortments.value.join(', ')}`);
        if (selectedDays.value.length) filters.push(`Days: ${selectedDays.value.join(', ')}`);
        if (openOnly.value) filters.push('Open stores only');
        if (promoOnly.value) filters.push('Promo only');
        if (onlySchoolHoliday.value) filters.push('School holiday only');
        return filters;
    });

    const dataReady = computed(() => rows.value.length > 0);

    function normalizeRow(raw: Record<string, unknown>): RossmannRow | null {
        const date = raw.Date ? new Date(String(raw.Date)) : null;
        if (!date || Number.isNaN(date.getTime())) return null;
        const sales = Number(raw.Sales);
        const customers = Number(raw.Customers);
        if (Number.isNaN(sales) || Number.isNaN(customers)) return null;
        return {
            Store: Number(raw.Store),
            DayOfWeek: Number(raw.DayOfWeek),
            Date: date,
            Sales: sales,
            Customers: customers,
            Open: Number(raw.Open) === 1,
            Promo: Number(raw.Promo) === 1,
            StateHoliday: String(raw.StateHoliday ?? ''),
            SchoolHoliday: Number(raw.SchoolHoliday) === 1,
            StoreType: String(raw.StoreType ?? ''),
            Assortment: String(raw.Assortment ?? ''),
            CompetitionDistance: raw.CompetitionDistance === null ? null : Number(raw.CompetitionDistance),
            State: String(raw.State ?? ''),
            Promo2: Number(raw.Promo2 ?? 0) === 1,
        };
    }

    async function loadData(full: boolean = false) {
        fastMode.value = !full;
        sampleLimit.value = full ? null : 25_000;
        loading.value = true;
        // clear previous errors when starting a load so the loader/progress show cleanly
        errorMessage.value = '';
        totalRows.value = 0;
        progress.value = 0;
        rows.value = [];
        limits.value = {
            salesMin: Number.POSITIVE_INFINITY,
            salesMax: 0,
            customersMin: Number.POSITIVE_INFINITY,
            customersMax: 0,
            dateMin: null,
            dateMax: null,
        };

        const expectedRows = full ? 1_017_209 : sampleLimit.value ?? 1_017_209;
        let finalized = false;
        const finalize = () => {
            if (finalized) return;
            finalized = true;
            dateRange.value = [limits.value.dateMin, limits.value.dateMax];
            progress.value = 100;
            loading.value = false;
            // persist to localStorage after load completes
            persistToLocalStorage();
        };

        await new Promise<void>((resolve, reject) => {
            const startDownloadParse = () => {
                Papa.parse<Record<string, unknown>>(dataUrl, {
                    download: true,
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    worker: false,
                    step: (result, parser) => {
                        const row = normalizeRow(result.data);
                        if (row) {
                            rows.value.push(row);
                            updateLimits(row);
                        }
                        totalRows.value += 1;
                        progress.value = Math.min(100, Math.round((totalRows.value / expectedRows) * 100));

                        if (sampleLimit.value && totalRows.value >= sampleLimit.value) {
                            parser.abort();
                            finalize();
                            resolve();
                        }
                    },
                    complete: () => {
                        finalize();
                        resolve();
                    },
                    error: (err: any) => {
                        console.warn('Papa.download parse failed, will try fetch+parse fallback:', err);
                        const msg = err && (err.message ?? String(err)) ? (err.message ?? String(err)) : '';
                        if (String(msg).includes('Range Not Satisfiable') || String(msg).includes('416')) {
                            fallbackFetchParse().then(resolve).catch(reject);
                        } else {
                            fallbackFetchParse().then(resolve).catch((fallbackErr) => {
                                console.error('Both download parse and fallback fetch failed', fallbackErr);
                                errorMessage.value = String(msg || (fallbackErr?.message ?? fallbackErr ?? 'Unknown error'));
                                loading.value = false;
                                progress.value = 0;
                                reject(fallbackErr);
                            });
                        }
                    },
                });
            };

            const fallbackFetchParse = async () => {
                try {
                    const resp = await fetch(dataUrl);
                    if (!resp.ok) {
                        const msg = `Failed to fetch CSV for fallback: ${resp.status} ${resp.statusText}`;
                        errorMessage.value = msg;
                        loading.value = false;
                        progress.value = 0;
                        throw new Error(msg);
                    }
                    const txt = await resp.text();
                    if (!txt || txt.trim().length === 0) {
                        const msg = 'Fetched CSV is empty during fallback. Ensure the file exists under frontend/public/data.';
                        errorMessage.value = msg;
                        loading.value = false;
                        progress.value = 0;
                        throw new Error(msg);
                    }
                    Papa.parse<Record<string, unknown>>(txt, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        worker: false,
                        step: (result, parser) => {
                            const row = normalizeRow(result.data);
                            if (row) {
                                rows.value.push(row);
                                updateLimits(row);
                            }
                            totalRows.value += 1;
                            progress.value = Math.min(100, Math.round((totalRows.value / expectedRows) * 100));
                            if (sampleLimit.value && totalRows.value >= sampleLimit.value) {
                                parser.abort();
                                finalize();
                                resolve();
                            }
                        },
                        complete: () => {
                            finalize();
                            resolve();
                        },
                        error: (e: any) => {
                            console.error('Fallback parse failed:', e);
                            errorMessage.value = e && (e.message ?? String(e)) ? (e.message ?? String(e)) : 'Fallback parse failed';
                            loading.value = false;
                            progress.value = 0;
                            reject(e);
                        },
                    });
                } catch (e) {
                    throw e;
                }
            };
            startDownloadParse();
        });
    }

    async function loadIfNeeded(full: boolean = false) {
        if (rows.value.length > 0) {
            if (full && fastMode.value) {
                await loadData(true);
            }
            return;
        }
        const restored = tryRestoreFromLocalStorage();
        if (restored) return;
        await loadData(full);
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(value);
    }

    function formatNumber(value: number) {
        return new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(value);
    }

    function clearFilters() {
        storeQuery.value = '';
        selectedStates.value = [];
        selectedStoreTypes.value = [];
        selectedAssortments.value = [];
        selectedDays.value = [];
        openOnly.value = false;
        promoOnly.value = false;
        onlySchoolHoliday.value = false;
        dateRange.value = [limits.value.dateMin, limits.value.dateMax];
    }

    return {
        // data
        rows,
        filteredRows,
        stats,
        limits,
        totalRows,
        loading,
        progress,
        errorMessage,
        // filters
        storeQuery,
        selectedStates,
        selectedStoreTypes,
        selectedAssortments,
        selectedDays,
        dateRange,
        openOnly,
        promoOnly,
        onlySchoolHoliday,
        // options
        stateOptions,
        storeTypeOptions,
        assortmentOptions,
        dayOptions,
        activeFilters,
        dataReady,
        fastMode,
        sampleLimit,
        // helpers
        clearFilters,
        loadData,
        loadIfNeeded,
        formatCurrency,
        formatNumber,
    } as const;
}

// singleton instance
const _rossmannData = createRossmannData();

export function useRossmannData() {
    return _rossmannData;
}
