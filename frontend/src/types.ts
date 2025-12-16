export type RossmannRow = {
  Store: number;
  DayOfWeek: number;
  Date: Date;
  Sales: number;
  Customers: number;
  Open: boolean;
  Promo: boolean;
  StateHoliday: string;
  SchoolHoliday: boolean;
  StoreType: string;
  Assortment: string;
  CompetitionDistance: number | null;
  State: string;
  Promo2: boolean;
};

export type Limits = {
  salesMin: number;
  salesMax: number;
  customersMin: number;
  customersMax: number;
  dateMin: Date | null;
  dateMax: Date | null;
};

export type SelectOption = { label: string; value: string | number };

export type StatsSummary = {
  avgSales: number;
  avgCustomers: number;
  totalSales: number;
  stores: number;
  rows: number;
};

