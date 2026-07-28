import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const DynamicForm = ({ fields = [], onSubmit, submitText = 'Submit', isLoading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        if (field.type === 'select') {
          return (
            <div key={field.name} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {field.label}
              </label>
              <select
                {...register(field.name, field.validation)}
                className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors[field.name] && (
                <p className="text-xs text-red-400 font-medium">{errors[field.name].message}</p>
              )}
            </div>
          );
        }

        if (field.type === 'textarea') {
          return (
            <div key={field.name} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {field.label}
              </label>
              <textarea
                {...register(field.name, field.validation)}
                rows={field.rows || 3}
                placeholder={field.placeholder}
                className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg py-2.5 px-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              {errors[field.name] && (
                <p className="text-xs text-red-400 font-medium">{errors[field.name].message}</p>
              )}
            </div>
          );
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            error={errors[field.name]?.message}
            {...register(field.name, field.validation)}
          />
        );
      })}

      <Button type="submit" isLoading={isLoading} className="w-full mt-4">
        {submitText}
      </Button>
    </form>
  );
};
