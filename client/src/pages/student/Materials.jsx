import React, { useEffect, useState } from 'react';
import { materialApi } from '../../services/materialApi';
import { MaterialCard } from '../../components/cards/MaterialCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Search, Filter } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';

export const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    materialApi.getMaterials()
      .then(res => setMaterials(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                          m.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Learning Materials & Notes</h1>
        <p className="text-xs text-slate-400 mt-1">Access lecture notes and course material assigned to your college</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonLoader count={4} className="h-44" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMaterials.map(m => (
            <MaterialCard key={m._id} material={m} isAdmin={false} />
          ))}
          {filteredMaterials.length === 0 && (
            <div className="col-span-3 text-center py-12 glass-card rounded-2xl text-slate-500">
              No materials match your filter criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
