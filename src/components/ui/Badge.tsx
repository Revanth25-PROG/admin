import React from 'react';
import { ExamTrack, Priority, Difficulty, TopicStatus, QuestionDifficulty } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'violet' | 'teal' | 'amber' | 'emerald' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'sm',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  const variantClasses = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    violet: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
    teal: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const TrackBadge: React.FC<{ track: ExamTrack; size?: 'sm' | 'md' }> = ({ track, size = 'sm' }) => {
  switch (track) {
    case 'appsc-prelims':
      return <Badge variant="blue" size={size}>APPSC Prelims</Badge>;
    case 'appsc-mains':
      return <Badge variant="violet" size={size}>APPSC Mains</Badge>;
    case 'semester':
      return <Badge variant="teal" size={size}>B.Tech Semester</Badge>;
    default:
      return <Badge variant="slate" size={size}>General</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'high':
      return <Badge variant="rose">High Priority</Badge>;
    case 'medium':
      return <Badge variant="amber">Medium</Badge>;
    case 'low':
      return <Badge variant="slate">Low</Badge>;
  }
};

export const DifficultyBadge: React.FC<{ difficulty: Difficulty | QuestionDifficulty | string }> = ({ difficulty }) => {
  switch (difficulty) {
    case 'hard':
    case 'difficult':
      return <Badge variant="rose">Difficult</Badge>;
    case 'very_difficult':
      return <Badge variant="rose">Very Difficult</Badge>;
    case 'exam_tricky':
      return <Badge variant="violet">Exam Tricky</Badge>;
    case 'moderate':
      return <Badge variant="amber">Moderate</Badge>;
    case 'easy':
      return <Badge variant="emerald">Easy</Badge>;
    default:
      return <Badge variant="slate">{String(difficulty)}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: TopicStatus }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="emerald">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="blue">In Progress</Badge>;
    case 'needs_revision':
      return <Badge variant="amber">Needs Revision</Badge>;
    case 'not_started':
      return <Badge variant="slate">Not Started</Badge>;
  }
};
