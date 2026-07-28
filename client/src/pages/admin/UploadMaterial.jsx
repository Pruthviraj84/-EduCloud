import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '../../services/materialApi';
import { adminApi } from '../../services/adminApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Upload, CheckCircle } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';

export const UploadMaterial = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Computer Science',
    semester: 1,
    collegeId: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    adminApi.getColleges().then(res => {
      setColleges(res.data || []);
      if (res.data && res.data.length > 0) {
        setFormData(prev => ({ ...prev, collegeId: res.data[0]._id }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    setLoading(true);
    setSuccess('');
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('department', formData.department);
    uploadData.append('semester', formData.semester);
    uploadData.append('collegeId', formData.collegeId);
    uploadData.append('file', file);

    try {
      await materialApi.uploadMaterial(uploadData);
      setSuccess('Material uploaded successfully!');
      setTimeout(() => navigate('/admin/materials'), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white mb-2">Upload Course Material</h1>
        <p className="text-xs text-slate-400 mb-6">Attach PDF notes or reference slides for target college students</p>

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Material Title"
            placeholder="e.g. Data Structures Chapter 3 Notes"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Summary of topics covered in document..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Target College</label>
              <select
                value={formData.collegeId}
                onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm"
              >
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
              required
            />
            <label htmlFor="file-upload" className="cursor-pointer text-xs font-semibold text-blue-400 hover:underline">
              {file ? file.name : 'Choose File to Upload'}
            </label>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-4">
            Upload & Publish Asset
          </Button>
        </form>
      </div>
    </div>
  );
};
