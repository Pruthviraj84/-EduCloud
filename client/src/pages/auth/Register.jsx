import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Building, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DEPARTMENTS } from '../../utils/constants';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeCode: 'AIT2026',
    department: 'Computer Science',
    rollNumber: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser(formData);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 my-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-wide">Create Student Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join your college SaaS learning & assessment hub</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            icon={User}
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="john@student.edu"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="College Tenant Code"
              name="collegeCode"
              icon={Building}
              placeholder="AIT2026"
              value={formData.collegeCode}
              onChange={handleChange}
              required
            />

            <Input
              label="Roll Number"
              name="rollNumber"
              placeholder="CS2026-001"
              value={formData.rollNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Complete Registration
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
