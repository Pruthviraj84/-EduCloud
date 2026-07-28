import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../services/testApi';
import { Award, CheckCircle, XCircle, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export const StudentResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testApi.getResultById(id)
      .then(res => setResult(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!result) return null;

  const isPassed = result.status === 'Passed';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/student/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="glass-card p-8 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
          isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
        }`}>
          {isPassed ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-3xl font-extrabold text-white">
          {isPassed ? 'Examination Passed!' : 'Better Luck Next Time'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {result.testId?.title}
        </p>

        <div className="grid grid-cols-3 gap-4 my-8 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Score</span>
            <p className="text-2xl font-extrabold text-white mt-1">{result.totalScore}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Percentage</span>
            <p className={`text-2xl font-extrabold mt-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.percentage}%
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Status</span>
            <p className={`text-2xl font-extrabold mt-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.status}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-6">
          Submitted on: {formatDate(result.submittedAt)}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button variant="primary" onClick={() => navigate(`/student/review-paper/${result._id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Review Solution Paper
          </Button>
        </div>
      </div>
    </div>
  );
};
