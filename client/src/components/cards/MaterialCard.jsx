import React from 'react';
import { FileText, Download, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const MaterialCard = ({ material, onDelete, isAdmin }) => {
  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {material.department || 'General'}
              </span>
              <h4 className="text-base font-bold text-white mt-1 line-clamp-1">{material.title}</h4>
            </div>
          </div>
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(material._id)}
              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Delete material"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3 line-clamp-2">
          {material.description || 'No description provided.'}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{material.uploadedBy?.name || 'Faculty'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button variant="secondary" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Material ({material.fileType?.toUpperCase() || 'PDF'})
          </Button>
        </a>
      </div>
    </div>
  );
};
