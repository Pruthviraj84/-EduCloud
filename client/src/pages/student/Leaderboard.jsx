import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Table } from '../../components/common/Table';

export const StudentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testApi.getLeaderboard()
      .then(res => setLeaderboard(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Rank',
      cell: (row) => {
        if (row.rank === 1) return <span className="flex items-center text-amber-400 font-extrabold text-base"><Trophy className="w-5 h-5 mr-1" /> #1</span>;
        if (row.rank === 2) return <span className="flex items-center text-slate-300 font-extrabold text-base"><Medal className="w-5 h-5 mr-1 text-slate-300" /> #2</span>;
        if (row.rank === 3) return <span className="flex items-center text-amber-600 font-extrabold text-base"><Award className="w-5 h-5 mr-1 text-amber-600" /> #3</span>;
        return <span className="font-bold text-slate-400 text-sm">#{row.rank}</span>;
      }
    },
    {
      header: 'Student Name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {row.studentId?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{row.studentId?.name || 'Student'}</p>
            <p className="text-[10px] text-slate-500">{row.studentId?.department || 'General'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Average Score',
      cell: (row) => <span className="font-bold text-blue-400">{row.averageScore}%</span>
    },
    {
      header: 'Accuracy',
      cell: (row) => <span className="font-bold text-emerald-400">{row.accuracy}%</span>
    },
    {
      header: 'Tests Taken',
      accessor: 'testsCompleted'
    },
    {
      header: 'Composite Rank Score',
      cell: (row) => <span className="font-bold text-purple-400">{row.scoreFormulaValue} pts</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">College Student Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated ranking based on Formula: (Avg Score × 0.5) + (Accuracy % × 0.3) + (Completion % × 0.2)
          </p>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
          <Trophy className="w-8 h-8" />
        </div>
      </div>

      <Table columns={columns} data={leaderboard} emptyMessage="Leaderboard empty. Complete tests to get ranked!" />
    </div>
  );
};
