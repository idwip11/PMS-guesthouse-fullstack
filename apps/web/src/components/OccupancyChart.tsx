import { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import type { ScriptableContext } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const OccupancyChart = () => {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<any>({
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    datasets: [],
  });

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    const createGradient = (ctx: CanvasRenderingContext2D, area: any) => {
        const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.0)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.4)');
        return gradient;
    };

    setChartData({
      labels: ['1', '5', '10', '15', '20', '25', '30'],
      datasets: [
        {
          label: 'Occupancy %',
          data: [65, 72, 68, 85, 80, 92, 78],
          borderColor: '#2563EB',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx;
            const area = context.chart.chartArea;
            if (!area) {
              return null;
            }
            return createGradient(ctx, area);
          },
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#2563EB',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    });
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)',
          borderDash: [5, 5],
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Line ref={chartRef} options={options as any} data={chartData} />
    </div>
  );
};

export default OccupancyChart;
