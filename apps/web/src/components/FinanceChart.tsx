
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinanceChartProps {
  data?: {
    name: string; // Month label
    income: number;
    expense: number;
  }[];
}

const FinanceChart = ({ data }: FinanceChartProps) => {
  const labels = data?.map(d => d.name) || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const incomeData = data?.map(d => d.income) || [];
  const expenseData = data?.map(d => d.expense) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: '#2563EB',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: '#94a3b8',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)',
          borderDash: [5, 5]
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value: any) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <div className="flex-1 w-full relative h-[250px]">
      <div className="absolute inset-0">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default FinanceChart;
