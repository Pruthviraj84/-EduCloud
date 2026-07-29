import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '../../services/materialApi';
import { adminApi } from '../../services/adminApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Upload, CheckCircle, FileText } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';

export const UploadMaterial = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Computer Science',
    department: 'Computer Science',
    semester: 1,
    collegeId: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getColleges().then(res => {
      const colList = res.data || [];
      setColleges(colList);
      if (colList.length > 0) {
        setFormData(prev => ({ ...prev, collegeId: colList[0]._id }));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a study material file (PDF, DOCX, PPT, or Image)');

    setLoading(true);
    setSuccess('');
    setError('');

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subject', formData.subject);
    uploadData.append('department', formData.department);
    uploadData.append('semester', formData.semester);
    if (formData.collegeId) {
      uploadData.append('collegeId', formData.collegeId);
    }
    uploadData.append('file', file);

    try {
      await materialApi.uploadMaterial(uploadData);
      setSuccess('Study material uploaded to Cloudinary successfully!');
      setTimeout(() => navigate('/admin/materials'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white mb-2">Upload Study Material</h1>
        <p className="text-xs text-slate-400 mb-6">Upload PDF, DOCX, PPT, or Image study files directly to Cloudinary for AI exam generation</p>

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Material Title"
            placeholder="e.g. Operating Systems Kernel Notes"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Name"
              placeholder="e.g. Operating Systems"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Summary of study topics covered in this material..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {colleges.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Target College</label>
              <select
                value={formData.collegeId}
                onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-900/50 hover:border-blue-500/50 transition-all">
            {file ? (
              <div className="flex items-center justify-center space-x-2 text-blue-400">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-semibold">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer text-xs font-semibold text-blue-400 hover:underline">
                  Choose PDF, DOCX, PPT, or Image file
                </label>
                <p className="text-[10px] text-slate-500 mt-1">Supports PDF, Word Documents, Presentations, and Scanned Image OCR</p>
              </>
            )}
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-4">
            Upload to Cloudinary & Save Metadata
          </Button>
        </form>
      </div>
    </div>
  );
};
