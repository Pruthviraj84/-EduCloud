import React from 'react';
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
import { Line } from 'react-chartjs-2';

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

export const PerformanceChart = ({ results = [] }) => {
  const sorted = [...results].reverse();
  const labels = sorted.map((r, i) => r.testId?.title ? r.testId.title.slice(0, 15) : `Test #${i + 1}`);
  const scores = sorted.map(r => r.percentage || 0);

  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        fill: true,
        label: 'Score Percentage (%)',
        data: scores.length > 0 ? scores : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#1d4ed8',
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};
