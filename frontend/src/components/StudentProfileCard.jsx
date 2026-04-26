import { useState } from 'react';
import { updateStudent } from '../services/api';

const GRADE_COLORS = {
  9:  'bg-sky-100 text-sky-700',
  10: 'bg-violet-100 text-violet-700',
  11: 'bg-amber-100 text-amber-700',
  12: 'bg-emerald-100 text-emerald-700',
};

/**
 * Displays student name, grade, and profile notes.
 * Supports inline editing of profile notes via a pencil icon.
 * onUpdated(patch) is called with the saved fields after a successful save.
 */
export default function StudentProfileCard({ student, onUpdated, compact = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function startEdit() {
    setDraft(student.profile || '');
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function saveEdit() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStudent(student.id, { profile: draft });
      onUpdated?.({ profile: updated.profile });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (compact) {
    // Compact layout used inside the drawer
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="text-center px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
              <div className="text-lg font-bold text-rose-600 leading-none">
                {student.requests?.filter((r) => r.type === 'priority').length ?? 0}
              </div>
              <div className="text-xs text-rose-500 font-medium mt-0.5">Priority</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-lg font-bold text-indigo-600 leading-none">
                {student.requests?.filter((r) => r.type === 'elective').length ?? 0}
              </div>
              <div className="text-xs text-indigo-500 font-medium mt-0.5">Elective</div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="text-xs font-medium bg-indigo-600 text-white px-2.5 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs font-medium text-slate-600 px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <p className="text-xs text-slate-500 leading-relaxed pr-6">
                  {student.profile || <span className="italic text-slate-400">No counselor notes</span>}
                </p>
                <button
                  onClick={startEdit}
                  title="Edit notes"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full layout used on the StudentDetail page
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[student.grade] || 'bg-slate-100 text-slate-600'}`}>
              Grade {student.grade}
            </span>
            <span className="text-xs text-slate-400 font-mono">{student.id}</span>
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add counselor notes…"
                className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed max-w-2xl"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="text-sm font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-sm font-medium text-slate-600 px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex items-start gap-2">
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                {student.profile || <span className="italic text-slate-400">No counselor notes — click to add</span>}
              </p>
              <button
                onClick={startEdit}
                title="Edit notes"
                className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm shrink-0">
          <div className="text-center px-4 py-2 bg-rose-50 rounded-lg border border-rose-100">
            <div className="text-xl font-bold text-rose-600">
              {student.requests?.filter((r) => r.type === 'priority').length ?? 0}
            </div>
            <div className="text-xs text-rose-500 font-medium">Priority</div>
          </div>
          <div className="text-center px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="text-xl font-bold text-indigo-600">
              {student.requests?.filter((r) => r.type === 'elective').length ?? 0}
            </div>
            <div className="text-xs text-indigo-500 font-medium">Elective</div>
          </div>
        </div>
      </div>
    </div>
  );
}
