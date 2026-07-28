import React, { useState, useEffect } from 'react';
import { testApi } from '../../services/testApi';
import { adminApi } from '../../services/adminApi';
import { TestCreationForm } from '../../components/forms/TestCreationForm';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const CreateTest = () => {
  const [tests, setTests] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Question adding state
  const [activeTestForQuestions, setActiveTestForQuestions] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [qData, setQData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    marks: 1,
    difficulty: 'Medium'
  });

  const loadData = () => {
    adminApi.getColleges().then(res => {
      setColleges(res.data || []);
      if (res.data && res.data.length > 0 && !selectedCollege) {
        setSelectedCollege(res.data[0]._id);
      }
    });

    testApi.getTests().then(res => setTests(res.data || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTest = async (formData) => {
    setLoading(true);
    try {
      await testApi.createTest({
        ...formData,
        collegeId: selectedCollege,
        schedule: {
          startDate: formData.startDate || new Date(),
          endDate: formData.endDate
        }
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      await testApi.deleteTest(id);
      loadData();
    }
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      await testApi.addQuestion({
        testId: activeTestForQuestions._id,
        questionText: qData.questionText,
        options: [
          { key: 'A', text: qData.optionA },
          { key: 'B', text: qData.optionB },
          { key: 'C', text: qData.optionC },
          { key: 'D', text: qData.optionD }
        ],
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        marks: parseInt(qData.marks),
        difficulty: qData.difficulty
      });
      setQuestionModalOpen(false);
      setQData({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        marks: 1,
        difficulty: 'Medium'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Department', accessor: 'department' },
    { header: 'Duration', cell: (row) => `${row.duration} Mins` },
    { header: 'Questions', cell: (row) => row.questions?.length || 0 },
    { header: 'End Date', cell: (row) => formatDate(row.schedule?.endDate) },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTestForQuestions(row);
              setQuestionModalOpen(true);
            }}
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Add Question
          </Button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Test & Examination Setup</h1>
          <p className="text-xs text-slate-400 mt-1">Configure scheduled exam papers and question items</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Create New Test
        </Button>
      </div>

      {/* College Tenant Selector */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select College Tenant:</span>
        <select
          value={selectedCollege}
          onChange={e => setSelectedCollege(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-xl px-4 py-2 focus:outline-none"
        >
          {colleges.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={tests} emptyMessage="No tests created yet." />

      {/* Modal for Creating Test */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Test Paper">
        <TestCreationForm onSubmit={handleCreateTest} isLoading={loading} />
      </Modal>

      {/* Modal for Adding Question */}
      <Modal isOpen={questionModalOpen} onClose={() => setQuestionModalOpen(false)} title={`Add Question to ${activeTestForQuestions?.title}`}>
        <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Question Text</label>
            <textarea
              rows={3}
              value={qData.questionText}
              onChange={e => setQData({ ...qData, questionText: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Option A"
              value={qData.optionA}
              onChange={e => setQData({ ...qData, optionA: e.target.value })}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Option B"
              value={qData.optionB}
              onChange={e => setQData({ ...qData, optionB: e.target.value })}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Option C"
              value={qData.optionC}
              onChange={e => setQData({ ...qData, optionC: e.target.value })}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Option D"
              value={qData.optionD}
              onChange={e => setQData({ ...qData, optionD: e.target.value })}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Correct Option</label>
              <select
                value={qData.correctAnswer}
                onChange={e => setQData({ ...qData, correctAnswer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-sm"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Marks</label>
              <input
                type="number"
                value={qData.marks}
                onChange={e => setQData({ ...qData, marks: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Difficulty</label>
              <select
                value={qData.difficulty}
                onChange={e => setQData({ ...qData, difficulty: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-sm"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Explanation</label>
            <textarea
              rows={2}
              value={qData.explanation}
              onChange={e => setQData({ ...qData, explanation: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-sm"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Question to Bank
          </Button>
        </form>
      </Modal>
    </div>
  );
};
