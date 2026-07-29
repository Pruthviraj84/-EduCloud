import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../services/testApi';
import { useTimer } from '../../hooks/useTimer';
import { useTestSubmit } from '../../hooks/useTestSubmit';
import { Clock, AlertTriangle, Send, Bookmark } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { submitTest, submitting } = useTestSubmit();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedOption }
  const [markedForReview, setMarkedForReview] = useState({}); // { [questionId]: boolean }
  const [startedAt] = useState(() => new Date().toISOString());
  const [loading, setLoading] = useState(true);

  // Auto-submit callback when countdown hits 0
  const handleAutoSubmit = useCallback(() => {
    console.log('[Exam Engine] Countdown expired. Triggering automated server submission...');
    const formattedAnswers = Object.keys(userAnswers).map(qId => ({
      questionId: qId,
      selectedOption: userAnswers[qId]
    }));
    submitTest({ testId, answers: formattedAnswers, startedAt });
  }, [testId, userAnswers, startedAt, submitTest]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const [testRes, qRes] = await Promise.all([
          testApi.getTestById(testId),
          testApi.getQuestionsByTest(testId, 'take')
        ]);
        setTest(testRes.data);
        setQuestions(qRes.data || []);
      } catch (err) {
        console.error('Failed to load exam:', err.message);
        navigate('/student/tests');
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [testId, navigate]);

  const { formattedTime } = useTimer(
    testId,
    test?.duration || 30,
    handleAutoSubmit
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400">Loading Secure Examination Portal...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (optionKey) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({ ...prev, [currentQ._id]: optionKey }));
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => ({ ...prev, [currentQ._id]: !prev[currentQ._id] }));
  };

  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam now?')) {
      handleAutoSubmit();
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h2 className="text-base font-bold text-white line-clamp-1">{test?.title}</h2>
          <p className="text-xs text-slate-400">
            Total Questions: <span className="text-blue-400 font-semibold">{questions.length}</span>
          </p>
        </div>

        {/* Real-time Timer display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-blue-500/40 text-blue-400 font-mono text-lg font-extrabold shadow-inner">
            <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
            <span>{formattedTime}</span>
          </div>

          <Button variant="danger" size="sm" onClick={handleManualSubmit} isLoading={submitting}>
            <Send className="w-4 h-4 mr-1.5" />
            Submit Paper
          </Button>
        </div>
      </header>

      {/* Main Exam Interface */}
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 max-w-7xl w-full mx-auto">
        {/* Left Side: Question Display */}
        <div className="flex-1 flex flex-col justify-between glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
          {currentQ ? (
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {currentQ.marks || 1} Marks
                  </span>
                  <button
                    onClick={toggleMarkForReview}
                    className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-lg border transition ${
                      markedForReview[currentQ._id]
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQ._id] ? 'Marked' : 'Mark for Review'}</span>
                  </button>
                </div>
              </div>

              {/* Question Stem */}
              <h3 className="text-lg font-semibold text-white mb-6 leading-relaxed">
                {currentQ.questionText || currentQ.question}
              </h3>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQ.options?.map((opt, oIdx) => {
                  const keysMap = ['A', 'B', 'C', 'D'];
                  const optKey = typeof opt === 'object' && opt !== null ? (opt.key || keysMap[oIdx]) : keysMap[oIdx];
                  const optText = typeof opt === 'object' && opt !== null ? (opt.text || '') : String(opt);
                  const isSelected = userAnswers[currentQ._id] === optKey;

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleOptionSelect(optKey)}
                      className={`w-full flex items-center p-4 rounded-2xl border text-left transition duration-200 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm mr-4 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {optKey}
                      </div>
                      <span className="text-sm font-medium">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No question selected</div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next Question
            </Button>
          </div>
        </div>

        {/* Right Side: Question Palette Panel */}
        <div className="w-full md:w-80 glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Question Palette</h4>
            
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q._id];
                const isMarked = !!markedForReview[q._id];
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isCurrent) btnStyle = 'ring-2 ring-blue-500 bg-blue-600/30 text-white border-blue-400';
                else if (isMarked) btnStyle = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
                else if (isAnswered) btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs border transition ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500 inline-block" />
                <span>Answered</span>
              </span>
              <span className="font-bold text-white">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500 inline-block" />
                <span>Marked for Review</span>
              </span>
              <span className="font-bold text-white">{reviewCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 inline-block" />
                <span>Unanswered</span>
              </span>
              <span className="font-bold text-white">{questions.length - answeredCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
