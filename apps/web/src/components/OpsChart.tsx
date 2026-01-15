import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ScriptableContext } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { budgetsApi } from '../services/api';
import type { Expense, OperationalBudget } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OpsChartProps {
  expenses: Expense[];
}

export default function OpsChart({ expenses }: OpsChartProps) {
  const [budgets, setBudgets] = useState<OperationalBudget[]>([]);
  
  // Get last 6 months first to determine which years we need
  const getLast6Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: date.getMonth() + 1, // 1-12
        year: date.getFullYear(),
        label: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return months;
  };

  const last6Months = getLast6Months();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      // Get unique years from last 6 months
      const years = [...new Set(last6Months.map(m => m.year))];
      console.log('Fetching budgets for years:', years);
      
      // Fetch budgets for all relevant years
      const allBudgets = await Promise.all(
        years.map(year => budgetsApi.getByYear(year))
      );
      
      const flattenedBudgets = allBudgets.flat();
      console.log('Fetched budgets:', flattenedBudgets);
      setBudgets(flattenedBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Calculate actual expenses per month
  const actualExpenses = last6Months.map(({ month, year }) => {
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.dateIncurred);
      return expDate.getMonth() + 1 === month && expDate.getFullYear() === year;
    });
    return monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  });

  // Get projected budgets per month
  const projectedBudgets = last6Months.map(({ month, year }) => {
    const budget = budgets.find(b => b.month === month && b.year === year);
    console.log(`Looking for budget: month=${month}, year=${year}, found:`, budget);
    return budget ? parseFloat(budget.projectedAmount) : null;
  });

  const data = {
    labels: last6Months.map(m => m.label),
    datasets: [
      {
        label: 'Actual Expenses',
        data: actualExpenses,
        borderColor: '#F97316', // Orange
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0.0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#F97316',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Projected Budget',
        data: projectedBudgets,
        borderColor: '#94a3b8', // Slate 400
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#94a3b8',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        spanGaps: true // Connect points even if some values are null
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: '#64748b' // Slate 500
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
              label += 'Rp ' + context.parsed.y.toLocaleString('id-ID');
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
            return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
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

  return <Line data={data} options={options} />;
}
