import React from 'react';
import { FileText, Download, Trash2, Calendar, User, FileCode, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const MaterialCard = ({ material, onDelete, isAdmin }) => {
  const downloadUrl = material.cloudinaryUrl || material.fileUrl;
  const fileType = (material.fileType || 'pdf').toUpperCase();

  const renderIcon = () => {
    if (fileType === 'IMAGE') return <ImageIcon className="w-6 h-6 text-emerald-400" />;
    if (fileType === 'DOCX' || fileType === 'DOC') return <FileCode className="w-6 h-6 text-indigo-400" />;
    return <FileText className="w-6 h-6 text-blue-400" />;
  };

  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {material.department || 'General'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {fileType}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 line-clamp-1">{material.title}</h4>
            </div>
          </div>
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(material._id)}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Delete from Cloudinary and DB"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3 line-clamp-2">
          {material.description || 'No description provided.'}
        </p>

        {material.subject && (
          <p className="text-xs text-slate-300 font-semibold mt-2">
            Subject: <span className="text-blue-400">{material.subject}</span>
          </p>
        )}

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
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block"
        >
          <Button variant="secondary" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            View / Download Asset ({fileType})
          </Button>
        </a>
      </div>
    </div>
  );
};
