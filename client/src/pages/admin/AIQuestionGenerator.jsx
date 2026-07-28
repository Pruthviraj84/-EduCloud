import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../services/testApi';
import { adminApi } from '../../services/adminApi';
import { Cpu, Upload, FileText, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AIQuestionGenerator = () => {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [subjectName, setSubjectName] = useState('Computer Science');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getColleges().then(res => {
      setColleges(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedCollege(res.data[0]._id);
      }
    });
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!textInput && !file) {
      setError('Please enter text contents or select a PDF file');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedResult(null);

    const formData = new FormData();
    formData.append('testTitle', testTitle);
    formData.append('subjectName', subjectName);
    formData.append('questionCount', questionCount);
    formData.append('collegeId', selectedCollege);
    if (textInput) formData.append('textInput', textInput);
    if (file) formData.append('file', file);

    try {
      const res = await testApi.generateTestWithAI(formData);
      if (res.success && res.data) {
        setGeneratedResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'AI Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">OpenAI API JSON Pipeline</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">AI-Powered Exam Paper Generator</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Upload PDF lecture notes (with automatic Tesseract OCR fallback for scanned documents) or paste raw text to auto-generate multiple-choice questions matching Mongoose schema.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!generatedResult ? (
        <div className="glass-card p-8 rounded-3xl border border-slate-800">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Test Paper Title"
                placeholder="e.g. Operating Systems Quiz 1"
                value={testTitle}
                onChange={e => setTestTitle(e.target.value)}
                required
              />

              <Input
                label="Subject Name"
                placeholder="Computer Science"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Tenant College
                </label>
                <select
                  value={selectedCollege}
                  onChange={e => setSelectedCollege(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <Input
                label="Number of Questions to Generate"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={e => setQuestionCount(e.target.value)}
              />
            </div>

            {/* Source Content Inputs */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Upload PDF Course Material (with OCR Engine)
              </label>
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition">
                <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer text-xs font-semibold text-blue-400 hover:underline">
                  {file ? file.name : 'Click to upload PDF Document'}
                </label>
                <p className="text-[10px] text-slate-500 mt-1">Supports pdf-parse & Tesseract OCR for scanned documents</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Or Paste Text Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste syllabus, textbook chapter, or lecture summary text here..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3">
              <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
              Generate Exam via OpenAI Pipeline
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Generation Complete!</h3>
                <p className="text-xs text-slate-400">Created {generatedResult.questionCount} questions for "{generatedResult.test?.title}"</p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate('/admin/create-test')}>
              View All Tests
            </Button>
          </div>

          <div className="space-y-4">
            {generatedResult.test?.questions?.map((q, idx) => (
              <div key={q._id || idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Question {idx + 1} ({q.difficulty})</span>
                  <span className="text-xs font-mono text-emerald-400">Correct: Option {q.correctAnswer}</span>
                </div>
                <p className="text-sm font-semibold text-white">{q.questionText}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map(opt => (
                    <div key={opt.key} className={`p-2.5 rounded-xl border text-xs ${
                      opt.key === q.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <span className="mr-2 text-slate-500">{opt.key}.</span> {opt.text}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <strong className="text-blue-400">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
