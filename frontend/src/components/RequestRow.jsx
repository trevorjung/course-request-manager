import { useState } from 'react';
import { updateRequest, deleteRequest } from '../services/api';

const DEPT_COLORS = {
  'Math':          'bg-blue-100 text-blue-700',
  'English':       'bg-purple-100 text-purple-700',
  'Social Studies':'bg-orange-100 text-orange-700',
  'Science':       'bg-green-100 text-green-700',
  'Arts & Tech':   'bg-pink-100 text-pink-700',
};

export default function RequestRow({ req, studentId, onUpdate, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleToggle() {
    setToggling(true);
    const newType = req.type === 'priority' ? 'elective' : 'priority';
    try {
      const updated = await updateRequest(studentId, req.id, { type: newType });
      onUpdate(updated);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${req.course.code} – ${req.course.name}?`)) return;
    setRemoving(true);
    try {
      await deleteRequest(studentId, req.id);
      onDelete(req.id);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-lg group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-slate-400">{req.course.code}</span>
          <span className="font-medium text-slate-900 text-sm">{req.course.name}</span>
          {req.note && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              {req.note}
            </span>
          )}
        </div>
        <div className="mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[req.course.department] || 'bg-slate-100 text-slate-600'}`}>
            {req.course.department}
          </span>
          <span className="text-xs text-slate-400 ml-2">Grades {req.course.grades}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={`Change to ${req.type === 'priority' ? 'elective' : 'priority'}`}
          className="text-xs px-2.5 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {toggling ? '…' : `→ ${req.type === 'priority' ? 'Elective' : 'Priority'}`}
        </button>
        <button
          onClick={handleDelete}
          disabled={removing}
          title="Remove course"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {removing ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
