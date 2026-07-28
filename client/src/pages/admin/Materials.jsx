import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '../../services/materialApi';
import { MaterialCard } from '../../components/cards/MaterialCard';
import { Button } from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';

export const AdminMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);

  const loadMaterials = () => {
    materialApi.getMaterials().then(res => setMaterials(res.data || []));
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this material?')) {
      await materialApi.deleteMaterial(id);
      loadMaterials();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Manage Learning Materials</h1>
          <p className="text-xs text-slate-400 mt-1">Upload and govern lecture notes, PDF guides & reference files</p>
        </div>
        <Button onClick={() => navigate('/admin/upload-material')}>
          <PlusCircle className="w-4 h-4 mr-2" /> Upload Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materials.map(m => (
          <MaterialCard key={m._id} material={m} onDelete={handleDelete} isAdmin={true} />
        ))}
        {materials.length === 0 && (
          <div className="col-span-3 text-center py-12 glass-card rounded-2xl text-slate-500">
            No materials uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};
