export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'hard':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};
