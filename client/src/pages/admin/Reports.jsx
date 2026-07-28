import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { StatCard } from '../../components/cards/StatCard';
import { ScoreDistributionChart } from '../../components/charts/ScoreDistributionChart';
import { Users, FileText, Award, BarChart3 } from 'lucide-react';

export const Reports = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    adminApi.getAnalyticsReport().then(res => setReport(res.data || null));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Multi-College System Analytics & Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Aggregated academic metrics across colleges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={report?.totalStudents || 0} icon={Users} color="blue" />
        <StatCard title="Tests Created" value={report?.totalTests || 0} icon={FileText} color="purple" />
        <StatCard title="Total Submissions" value={report?.totalSubmissions || 0} icon={Award} color="emerald" />
        <StatCard title="Average Pass Rate" value={`${report?.avgScore || 0}%`} icon={BarChart3} color="amber" />
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Exam Performance Breakdown</h3>
        <ScoreDistributionChart passed={report?.passedCount || 0} failed={report?.failedCount || 0} />
      </div>
    </div>
  );
};
