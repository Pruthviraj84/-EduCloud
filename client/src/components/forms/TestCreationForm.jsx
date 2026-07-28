import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DEPARTMENTS } from '../../utils/constants';

export const TestCreationForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      duration: 30,
      passingMarks: 40,
      attemptsAllowed: 1,
      negativeMarking: 0,
      department: 'Computer Science',
      shuffleQuestions: true,
      shuffleOptions: true
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Test Title"
        placeholder="e.g. Mid-Term Software Engineering Exam"
        error={errors.title?.message}
        {...register('title', { required: 'Test title is required' })}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="Brief instructions or syllabus covered..."
          className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Department
          </label>
          <select
            {...register('department')}
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <Input
          label="Duration (Minutes)"
          type="number"
          error={errors.duration?.message}
          {...register('duration', { required: 'Duration is required', min: 1 })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Passing Marks %"
          type="number"
          {...register('passingMarks')}
        />
        <Input
          label="Attempts Allowed"
          type="number"
          {...register('attemptsAllowed')}
        />
        <Input
          label="Negative Mark (per wrong)"
          type="number"
          step="0.25"
          {...register('negativeMarking')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Schedule Start Date"
          type="datetime-local"
          {...register('startDate')}
        />
        <Input
          label="Schedule End Date"
          type="datetime-local"
          error={errors.endDate?.message}
          {...register('endDate', { required: 'Scheduled end date is required' })}
        />
      </div>

      <div className="flex items-center space-x-6 py-2">
        <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" {...register('shuffleQuestions')} className="rounded bg-slate-900 border-slate-800 text-blue-600" />
          <span>Shuffle Questions</span>
        </label>
        <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" {...register('shuffleOptions')} className="rounded bg-slate-900 border-slate-800 text-blue-600" />
          <span>Shuffle Options</span>
        </label>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full mt-4">
        Create & Configure Test Paper
      </Button>
    </form>
  );
};
