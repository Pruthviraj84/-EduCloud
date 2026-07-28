import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Building2, PlusCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', contactEmail: '' });
  const [loading, setLoading] = useState(false);

  const loadColleges = () => {
    adminApi.getColleges().then(res => setColleges(res.data || []));
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createCollege(formData);
      setIsOpen(false);
      setFormData({ name: '', code: '', address: '', contactEmail: '' });
      loadColleges();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    await adminApi.toggleCollegeStatus(id);
    loadColleges();
  };

  const columns = [
    { header: 'College Name', accessor: 'name' },
    {
      header: 'Tenant Code',
      cell: (row) => <span className="font-mono text-blue-400 font-bold">{row.code}</span>
    },
    { header: 'Contact Email', accessor: 'contactEmail' },
    { header: 'Created Date', cell: (row) => formatDate(row.createdAt) },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          row.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {row.isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => handleToggle(row._id)}
          className="text-slate-400 hover:text-white flex items-center text-xs"
        >
          {row.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400 mr-1" /> : <ToggleLeft className="w-5 h-5 text-slate-500 mr-1" />}
          Toggle Access
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Multi-Tenant Colleges</h1>
          <p className="text-xs text-slate-400 mt-1">Register and provision college tenants in SaaS architecture</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Register New College
        </Button>
      </div>

      <Table columns={columns} data={colleges} emptyMessage="No colleges registered yet" />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register Tenant College">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="College Name"
            placeholder="e.g. Apex Institute of Technology"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Tenant Code (Unique uppercase)"
            placeholder="AIT2026"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />

          <Input
            label="Contact Email"
            type="email"
            placeholder="admin@college.edu"
            value={formData.contactEmail}
            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
          />

          <Input
            label="Address"
            placeholder="100 Innovation Campus"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <Button type="submit" isLoading={loading} className="w-full mt-4">
            Register College Tenant
          </Button>
        </form>
      </Modal>
    </div>
  );
};
