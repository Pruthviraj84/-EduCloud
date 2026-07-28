import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { testApi } from '../../services/testApi';
import { materialApi } from '../../services/materialApi';
import { StatCard } from '../../components/cards/StatCard';
import { TestCard } from '../../components/cards/TestCard';
import { MaterialCard } from '../../components/cards/MaterialCard';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { BookOpen, FileText, Trophy, Award, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [results, setResults] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, matRes, resRes, lbRes] = await Promise.all([
          testApi.getTests(),
          materialApi.getMaterials(),
          testApi.getResults(),
          testApi.getLeaderboard()
        ]);

        setTests(testsRes.data || []);
        setMaterials(matRes.data || []);
        setResults(resRes.data || []);

        const studentLb = (lbRes.data || []).find(l => l.studentId?._id === user?._id || l.studentId === user?._id);
        if (studentLb) setRank(studentLb.rank);
      } catch (err) {
        console.error('Student Dashboard Fetch Error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const completedCount = results.length;
  const avgScore = completedCount > 0 ? results.reduce((acc, r) => acc + (r.percentage || 0), 0) / completedCount : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            {user?.department || 'Student Portal'}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Access your college lecture notes, take assigned examinations, and track your rank on the leaderboard.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Tests"
          value={tests.length}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Tests Attempted"
          value={completedCount}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Average Score"
          value={`${Math.round(avgScore)}%`}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="College Rank"
          value={rank ? `#${rank}` : 'Unranked'}
          icon={Trophy}
          color="amber"
        />
      </div>

      {/* Chart & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
            <span className="text-xs text-slate-400">Score Progression</span>
          </div>
          <PerformanceChart results={results} />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Recent Materials</h3>
              <button
                onClick={() => navigate('/student/materials')}
                className="text-xs text-blue-400 hover:underline flex items-center"
              >
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {materials.slice(0, 3).map(m => (
                <div key={m._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <p className="text-xs font-bold text-white line-clamp-1">{m.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.department || 'General'}</p>
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No materials uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Tests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Available Examinations</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/tests')}>
            View All Tests <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tests.slice(0, 3).map(t => (
            <TestCard key={t._id} test={t} isAdmin={false} />
          ))}
          {tests.length === 0 && (
            <div className="col-span-3 text-center py-10 glass-card rounded-2xl text-slate-500">
              No tests currently available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
