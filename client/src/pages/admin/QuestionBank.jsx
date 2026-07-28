import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { Table } from '../../components/common/Table';

export const QuestionBank = () => {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    testApi.getTests().then(res => {
      setTests(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedTestId(res.data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      testApi.getQuestionsByTest(selectedTestId).then(res => setQuestions(res.data || []));
    }
  }, [selectedTestId]);

  const columns = [
    { header: 'Question Text', accessor: 'questionText' },
    { header: 'Difficulty', accessor: 'difficulty' },
    { header: 'Correct Answer', cell: (row) => `Option ${row.correctAnswer}` },
    { header: 'Marks', accessor: 'marks' },
    { header: 'Source', cell: (row) => <span className="font-semibold text-blue-400">{row.source}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Question Bank Repository</h1>
          <p className="text-xs text-slate-400 mt-1">Browse items stored across test papers</p>
        </div>

        <select
          value={selectedTestId}
          onChange={e => setSelectedTestId(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl px-4 py-2"
        >
          {tests.map(t => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={questions} emptyMessage="No questions in this test bank" />
    </div>
  );
};
