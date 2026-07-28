import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { testApi } from '../../services/testApi';
import { materialApi } from '../../services/materialApi';
import { StatCard } from '../../components/cards/StatCard';
import { ScoreDistributionChart } from '../../components/charts/ScoreDistributionChart';
import { Building2, Users, FileText, Cpu, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [tests, setTests] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.getColleges(),
      testApi.getTests(),
      adminApi.getAnalyticsReport()
    ]).then(([colRes, testRes, repRes]) => {
      setColleges(colRes.data || []);
      setTests(testRes.data || []);
      setReport(repRes.data || null);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/30 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            Super Admin Suite
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Global SaaS Management Console</h1>
          <p className="text-sm text-slate-400 mt-1">
            Oversee tenant colleges, trigger AI test generation, manage exam papers, and inspect cross-college analytics.
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="primary" onClick={() => navigate('/admin/ai-generator')}>
            <Cpu className="w-4 h-4 mr-2" /> AI Test Generator
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/create-test')}>
            <PlusCircle className="w-4 h-4 mr-2" /> Create Test
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Tenant Colleges"
          value={colleges.length}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={report?.totalStudents || 0}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Tests"
          value={tests.length}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Exam Submissions"
          value={report?.totalSubmissions || 0}
          icon={Cpu}
          color="amber"
        />
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Overall Exam Pass/Fail Ratio</h3>
            <span className="text-xs text-slate-400">Multi-College Aggregated</span>
          </div>
          <ScoreDistributionChart
            passed={report?.passedCount || 0}
            failed={report?.failedCount || 0}
          />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Registered Colleges</h3>
          <div className="space-y-3">
            {colleges.slice(0, 4).map(c => (
              <div key={c._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <span className="text-[10px] text-blue-400 font-mono">CODE: {c.code}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
            {colleges.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No colleges registered yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
