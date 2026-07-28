import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { adminApi } from '../../services/adminApi';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { RefreshCw, Trophy } from 'lucide-react';

export const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    adminApi.getColleges().then(res => {
      setColleges(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedCollege(res.data[0]._id);
      }
    });
  }, []);

  const loadLeaderboard = (cId) => {
    if (!cId) return;
    testApi.getLeaderboard({ collegeId: cId }).then(res => setLeaderboard(res.data || []));
  };

  useEffect(() => {
    if (selectedCollege) {
      loadLeaderboard(selectedCollege);
    }
  }, [selectedCollege]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await testApi.recalculateLeaderboard({ collegeId: selectedCollege });
      loadLeaderboard(selectedCollege);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const columns = [
    { header: 'Rank', cell: (row) => <span className="font-bold text-amber-400">#{row.rank}</span> },
    {
      header: 'Student Name',
      cell: (row) => (
        <div>
          <p className="font-bold text-white">{row.studentId?.name || 'Student'}</p>
          <p className="text-[10px] text-slate-500">{row.studentId?.rollNumber}</p>
        </div>
      )
    },
    { header: 'Average Score', cell: (row) => `${row.averageScore}%` },
    { header: 'Accuracy', cell: (row) => `${row.accuracy}%` },
    { header: 'Tests Taken', accessor: 'testsCompleted' },
    { header: 'Score Formula Value', cell: (row) => `${row.scoreFormulaValue} pts` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Tenant Leaderboard Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Recalculate rankings using formula: (Avg Score × 0.5) + (Accuracy % × 0.3) + (Completion % × 0.2)</p>
        </div>
        <Button onClick={handleRecalculate} isLoading={recalculating}>
          <RefreshCw className="w-4 h-4 mr-2" /> Recalculate Rankings
        </Button>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select College Tenant:</span>
        <select
          value={selectedCollege}
          onChange={e => setSelectedCollege(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl px-4 py-2"
        >
          {colleges.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={leaderboard} emptyMessage="Leaderboard empty for selected college." />
    </div>
  );
};
