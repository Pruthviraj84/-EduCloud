import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, AlertCircle, Play, Eye } from 'lucide-react';
import { Button } from '../common/Button';

export const TestCard = ({ test, isAdmin }) => {
  const navigate = useNavigate();

  const isExpired = new Date(test.schedule?.endDate) < new Date();

  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {test.department || 'General'}
          </span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            isExpired ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {isExpired ? 'Closed' : 'Active'}
          </span>
        </div>

        <h4 className="text-base font-bold text-white mt-3 line-clamp-1">{test.title}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {test.description || 'Standard examination test paper.'}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 py-3 bg-slate-900/60 rounded-xl px-3 border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{test.duration} Minutes</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{test.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 col-span-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <span>Passing Marks: {test.passingMarks}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => navigate(`/admin/tests/${test._id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage Questions
          </Button>
        ) : (
          <Button
            variant={isExpired ? 'secondary' : 'primary'}
            size="sm"
            className="w-full"
            disabled={isExpired}
            onClick={() => navigate(`/student/take-test/${test._id}`)}
          >
            <Play className="w-4 h-4 mr-2" />
            {isExpired ? 'Exam Ended' : 'Start Exam'}
          </Button>
        )}
      </div>
    </div>
  );
};
