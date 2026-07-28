import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { TestCard } from '../../components/cards/TestCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Search } from 'lucide-react';

export const StudentTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    testApi.getTests()
      .then(res => setTests(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Examinations & Tests</h1>
        <p className="text-xs text-slate-400 mt-1">Select an active scheduled test paper to begin your exam attempt</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search test title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonLoader count={3} className="h-48" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(t => (
            <TestCard key={t._id} test={t} isAdmin={false} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 glass-card rounded-2xl text-slate-500">
              No active test papers scheduled at this moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
