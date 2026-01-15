import { useRef, useEffect, useState, useMemo } from 'react';
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
import type { Reservation } from '../types';

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

interface OccupancyChartProps {
  reservations?: Reservation[];
  totalRooms?: number;
  year?: number;
}

const OccupancyChart = ({ reservations = [], totalRooms = 0, year = new Date().getFullYear() }: OccupancyChartProps) => {
  const chartRef = useRef<any>(null);

  // Calculate monthly occupancy
  const monthlyOccupancy = useMemo(() => {
    const labels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const data = labels.map((_, monthIndex) => {
      if (totalRooms === 0) return 0;

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const potentialRoomNights = totalRooms * daysInMonth;
      
      let occupiedNights = 0;
      reservations.forEach(res => {
        if (res.status === 'Cancelled') return;
        
        const start = new Date(res.checkInDate);
        const end = new Date(res.checkOutDate);
        const filterStart = new Date(year, monthIndex, 1);
        const filterEnd = new Date(year, monthIndex + 1, 0);
        
        // Intersection
        const effectiveStart = start < filterStart ? filterStart : start;
        const effectiveEnd = end > filterEnd ? filterEnd : end;
        
        if (effectiveStart < effectiveEnd) {
          const diffTime = Math.abs(effectiveEnd.getTime() - effectiveStart.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          occupiedNights += diffDays;
        }
      });
      
      return Math.round((occupiedNights / potentialRoomNights) * 100);
    });

    return { labels, data };
  }, [reservations, totalRooms, year]);

  const [chartData, setChartData] = useState<any>({
    labels: monthlyOccupancy.labels,
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
      labels: monthlyOccupancy.labels,
      datasets: [
        {
          label: 'Occupancy %',
          data: monthlyOccupancy.data,
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
  }, [monthlyOccupancy]);

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
