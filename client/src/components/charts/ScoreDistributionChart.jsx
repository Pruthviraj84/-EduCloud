import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const ScoreDistributionChart = ({ passed = 0, failed = 0 }) => {
  const data = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passed, failed],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderColor: ['#047857', '#be123c'],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 12 } }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};
