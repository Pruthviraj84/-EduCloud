import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../services/testApi';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ReviewPaper = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testApi.getResultById(resultId)
      .then(res => setResult(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/student/results/${resultId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scorecard
        </Button>
        <span className="text-xs text-slate-400">Exam Solution Review</span>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-2">{result.testId?.title} - Answer Key Review</h2>
        <p className="text-xs text-slate-400 mb-6">Review your submitted choices alongside correct answers and step-by-step AI explanations.</p>

        <div className="space-y-6">
          {result.answers?.map((ans, idx) => {
            const q = ans.questionId;
            if (!q) return null;
            return (
              <div key={q._id || idx} className="p-6 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center ${
                    ans.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {ans.isCorrect ? (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Correct (+{ans.marksObtained})</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect ({ans.marksObtained})</>
                    )}
                  </span>
                </div>

                <h4 className="text-base font-semibold text-white">{q.questionText}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options?.map(opt => {
                    const isUserChoice = ans.selectedOption === opt.key;
                    const isCorrectChoice = q.correctAnswer === opt.key;

                    let style = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (isCorrectChoice) style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                    else if (isUserChoice && !isCorrectChoice) style = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';

                    return (
                      <div key={opt.key} className={`p-3 rounded-xl border text-xs flex items-center ${style}`}>
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold mr-3">
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-4 bg-blue-950/30 rounded-xl border border-blue-800/40 text-xs text-blue-300">
                    <p className="font-bold flex items-center mb-1">
                      <HelpCircle className="w-4 h-4 mr-1 text-blue-400" /> AI Step-by-Step Explanation:
                    </p>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
