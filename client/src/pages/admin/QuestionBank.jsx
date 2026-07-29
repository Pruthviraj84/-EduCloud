import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { Table } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Sparkles, Search, Filter } from 'lucide-react';

export const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const fetchQuestions = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (sourceFilter) params.source = sourceFilter;
    if (difficultyFilter) params.difficulty = difficultyFilter;

    testApi.getAllQuestions(params)
      .then(res => setQuestions(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, [sourceFilter, difficultyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const columns = [
    {
      header: 'Question Text',
      cell: (row) => (
        <div className="max-w-md space-y-1">
          <p className="font-semibold text-slate-100">{row.questionText || row.question}</p>
          {row.explanation && (
            <p className="text-[11px] text-slate-400 truncate">Explanation: {row.explanation}</p>
          )}
        </div>
      )
    },
    {
      header: 'Subject',
      cell: (row) => <span className="text-xs font-semibold text-slate-300">{row.subject || 'General'}</span>
    },
    {
      header: 'Difficulty',
      cell: (row) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          row.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
          row.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {row.difficulty}
        </span>
      )
    },
    {
      header: 'Correct Answer',
      cell: (row) => <span className="font-mono text-xs text-emerald-400 font-bold">Option {row.correctAnswer}</span>
    },
    {
      header: 'Marks',
      accessor: 'marks'
    },
    {
      header: 'Source',
      cell: (row) => (
        <span className={`inline-flex items-center space-x-1 text-xs font-bold ${
          row.source === 'AI' ? 'text-amber-400' : 'text-blue-400'
        }`}>
          {row.source === 'AI' && <Sparkles className="w-3 h-3 text-amber-400" />}
          <span>{row.source}</span>
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Question Bank Repository</h1>
          <p className="text-xs text-slate-400 mt-1">Central repository of AI-generated and manual examination questions</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5"
          >
            <option value="">All Sources</option>
            <option value="AI">Google Gemini AI</option>
            <option value="Manual">Manual</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </form>
      </div>

      <Table columns={columns} data={questions} emptyMessage="No questions found matching criteria" isLoading={loading} />
    </div>
  );
};
