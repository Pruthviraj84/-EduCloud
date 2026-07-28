import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';
import { User, Mail, Phone, Building, GraduationCap, Save, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await studentApi.updateProfile(formData);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-blue-400 font-medium mt-0.5">{user?.collegeId?.name || 'Assigned College Tenant'}</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address (ReadOnly)"
            icon={Mail}
            value={user?.email || ''}
            disabled
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Roll Number"
              icon={GraduationCap}
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            />
          </div>

          <Input
            label="Department"
            icon={Building}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <Button type="submit" isLoading={loading} className="w-full mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Profile Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
