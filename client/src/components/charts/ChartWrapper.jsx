import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'hsl(var(--foreground))',
        font: { family: 'inherit', size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: 'hsl(var(--card))',
      titleColor: 'hsl(var(--foreground))',
      bodyColor: 'hsl(var(--muted-foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'inherit', weight: '600' },
      bodyFont: { family: 'inherit' },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        font: { family: 'inherit', size: 11 },
      },
      grid: {
        color: 'hsl(var(--border))',
        drawBorder: false,
      },
      border: { display: false },
    },
    y: {
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        font: { family: 'inherit', size: 11 },
      },
      grid: {
        color: 'hsl(var(--border))',
        drawBorder: false,
      },
      border: { display: false },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'hsl(var(--foreground))',
        font: { family: 'inherit', size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: 'hsl(var(--card))',
      titleColor: 'hsl(var(--foreground))',
      bodyColor: 'hsl(var(--muted-foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  cutout: '65%',
};

function mergeOptions(base, overrides) {
  if (!overrides) return base;
  const merged = { ...base };
  for (const key in overrides) {
    if (
      typeof overrides[key] === 'object' &&
      overrides[key] !== null &&
      !Array.isArray(overrides[key]) &&
      typeof base[key] === 'object' &&
      base[key] !== null
    ) {
      merged[key] = mergeOptions(base[key], overrides[key]);
    } else {
      merged[key] = overrides[key];
    }
  }
  return merged;
}

export default function ChartWrapper({ type = 'line', data, options, className = '' }) {
  const chartOptions = type === 'doughnut' || type === 'pie'
    ? mergeOptions(doughnutOptions, options)
    : mergeOptions(defaultOptions, options);

  const ChartComponent = {
    line: Line,
    bar: Bar,
    doughnut: Doughnut,
    pie: Doughnut,
  }[type] || Line;

  return (
    <div className={`relative h-[300px] w-full ${className}`}>
      <ChartComponent data={data} options={chartOptions} />
    </div>
  );
}

export { Line, Bar, Doughnut, ChartJS, defaultOptions, doughnutOptions, mergeOptions };
