import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../services/testApi';
import { materialApi } from '../../services/materialApi';
import { adminApi } from '../../services/adminApi';
import { Cpu, Upload, Sparkles, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AIQuestionGenerator = () => {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  
  const [testTitle, setTestTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(30);
  const [passingMarks, setPassingMarks] = useState(40);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [selectedCollege, setSelectedCollege] = useState('');
  
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getColleges().then(res => {
      const colList = res.data || [];
      setColleges(colList);
      if (colList.length > 0) {
        setSelectedCollege(colList[0]._id);
      }
    }).catch(err => console.error(err));

    materialApi.getMaterials().then(res => {
      setMaterials(res.data || []);
    }).catch(err => console.error(err));
  }, []);

  const handleMaterialSelect = (matId) => {
    setSelectedMaterialId(matId);
    if (matId) {
      const mat = materials.find(m => m._id === matId);
      if (mat) {
        setSubject(mat.subject || 'General');
        setTestTitle(`AI Exam: ${mat.title}`);
      }
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId && !textInput && !file) {
      setError('Please select a study material, upload a document, or enter text content');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedResult(null);

    const formData = new FormData();
    formData.append('testTitle', testTitle || `AI Exam - ${subject}`);
    formData.append('subject', subject);
    formData.append('questionCount', questionCount);
    formData.append('duration', duration);
    formData.append('passingMarks', passingMarks);
    formData.append('negativeMarking', negativeMarking);
    if (selectedCollege) formData.append('collegeId', selectedCollege);
    if (selectedMaterialId) formData.append('studyMaterialId', selectedMaterialId);
    if (textInput) formData.append('textInput', textInput);
    if (file) formData.append('file', file);

    try {
      const res = await testApi.generateTestWithAI(formData);
      if (res.success && res.data) {
        setGeneratedResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Gemini AI Question Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-blue-950/30 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Google Gemini API Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">AI Examination Paper Generator</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Select uploaded Cloudinary Study Materials (PDF, DOCX, PPT, Images) or paste raw text. Google Gemini API will generate structured MCQs automatically.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 text-rose-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!generatedResult ? (
        <div className="glass-card p-8 rounded-3xl border border-slate-800">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. Select Cloudinary Study Material (Recommended)
              </label>
              <select
                value={selectedMaterialId}
                onChange={e => handleMaterialSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose from uploaded study materials --</option>
                {materials.map(m => (
                  <option key={m._id} value={m._id}>{m.title} ({m.subject}) - [{m.fileType.toUpperCase()}]</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Exam Paper Title"
                placeholder="e.g. Data Structures Midterm AI Exam"
                value={testTitle}
                onChange={e => setTestTitle(e.target.value)}
                required
              />

              <Input
                label="Subject Name"
                placeholder="Computer Science"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Questions Count"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={e => setQuestionCount(e.target.value)}
              />

              <Input
                label="Duration (Mins)"
                type="number"
                min="5"
                max="180"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />

              <Input
                label="Passing Marks %"
                type="number"
                min="1"
                max="100"
                value={passingMarks}
                onChange={e => setPassingMarks(e.target.value)}
              />

              <Input
                label="Negative Marking"
                type="number"
                step="0.25"
                min="0"
                value={negativeMarking}
                onChange={e => setNegativeMarking(e.target.value)}
              />
            </div>

            {colleges.length > 0 && (
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
            )}

            {/* Alternative Direct File Upload or Text */}
            {!selectedMaterialId && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Or Upload Document directly (PDF, DOCX, PPT, Image OCR)
                </label>
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition">
                  <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer text-xs font-semibold text-blue-400 hover:underline">
                    {file ? file.name : 'Click to select document'}
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, PPT, and Scanned Image OCR text extraction</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Or Paste Text Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste syllabus, lecture notes, or chapter text here..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500">
              <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
              Generate Exam via Google Gemini API
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Google Gemini Question Generation Complete!</h3>
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
                  <span className="text-xs font-mono text-emerald-400 font-bold">Correct Option: {q.correctAnswer}</span>
                </div>
                <p className="text-sm font-semibold text-white">{q.questionText || q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map((opt, oIdx) => {
                    const keysMap = ['A', 'B', 'C', 'D'];
                    const optKey = typeof opt === 'object' && opt !== null ? (opt.key || keysMap[oIdx]) : keysMap[oIdx];
                    const optText = typeof opt === 'object' && opt !== null ? (opt.text || '') : String(opt);
                    const isCorrect = q.correctAnswer === optKey || q.correctAnswer === oIdx || q.correctAnswer === String(oIdx);

                    return (
                      <div key={optKey} className={`p-2.5 rounded-xl border text-xs ${
                        isCorrect ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span className="mr-2 text-slate-500">{optKey}.</span> {optText}
                      </div>
                    );
                  })}
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
