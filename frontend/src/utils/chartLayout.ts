import type { Layout } from 'plotly.js';

export function buildLayout(title: string, yTitle?: string, extra?: Partial<Layout>): Partial<Layout> {
  return {
    title: { text: title },
    margin: { t: 48, r: 24, b: 48, l: 64 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', color: '#0f172a' },
    xaxis: { gridcolor: '#e5e7eb', zerolinecolor: '#e5e7eb' },
    yaxis: { title: yTitle ? { text: yTitle } : undefined, gridcolor: '#e5e7eb', zerolinecolor: '#e5e7eb' },
    ...extra,
  };
}

