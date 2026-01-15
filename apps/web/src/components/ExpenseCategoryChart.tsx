import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

interface ExpenseCategoryChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export default function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Colors similar to payment methods but for expenses
    const colors = [
      '#EF4444', // Red 500
      '#F59E0B', // Amber 500
      '#10B981', // Emerald 500
      '#3B82F6', // Blue 500
      '#6366F1', // Indigo 500
      '#8B5CF6', // Violet 500
      '#EC4899', // Pink 500
      '#64748B', // Slate 500
    ];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [
          {
            data: data.map(d => d.value),
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // We'll build a custom legend if needed, or just let tooltip handle it for simplicity in small space
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                if (value !== null) {
                  label += new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(value);
                  label += ` (${percentage}%)`;
                }
                return label;
              }
            }
          }
        },
        cutout: '70%',
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        No expense data for this period
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 relative">
            <canvas ref={chartRef}></canvas>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                        {data.length}
                    </span>
                    <span className="text-xs text-slate-500">Categories</span>
                </div>
            </div>
        </div>
        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {(() => {
                const totalValue = data.reduce((sum, item) => sum + item.value, 0);
                
                return data.slice(0, 4).map((item, index) => {
                    const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: [
                                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                                    '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
                                ][index % 8] }}
                            ></div>
                            <span className="truncate text-slate-600 dark:text-slate-400 font-medium" title={item.name}>
                                {item.name} <span className="text-slate-400">({percentage}%)</span>
                            </span>
                        </div>
                    );
                });
            })()}
             {data.length > 4 && (
                <div className="col-span-2 text-center text-slate-400 mt-1">
                    +{data.length - 4} more
                </div>
            )}
        </div>
    </div>
  );
}
