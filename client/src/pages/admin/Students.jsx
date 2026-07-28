import React, { useEffect, useState } from 'react';
import { studentApi } from '../../services/studentApi';
import { adminApi } from '../../services/adminApi';
import { Table } from '../../components/common/Table';
import { Search } from 'lucide-react';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getColleges().then(res => setColleges(res.data || []));
    studentApi.getStudents().then(res => setStudents(res.data || []));
  }, []);

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesCollege = selectedCollege === 'All' || s.collegeId?._id === selectedCollege;
    return matchesSearch && matchesCollege;
  });

  const columns = [
    {
      header: 'Student Name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{row.name}</p>
            <p className="text-[10px] text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'College Tenant',
      cell: (row) => <span className="font-medium text-slate-300">{row.collegeId?.name || 'N/A'}</span>
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Roll Number', accessor: 'rollNumber' },
    { header: 'Year', accessor: 'year' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Students Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Cross-tenant student user list with college binding</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCollege}
          onChange={e => setSelectedCollege(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl px-4 py-2 focus:outline-none"
        >
          <option value="All">All Tenant Colleges</option>
          {colleges.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={filtered} emptyMessage="No students found." />
    </div>
  );
};
