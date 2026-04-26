import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, addRequest, updateStudent } from '../services/api';
import AddCourseModal from './AddCourseModal';
import RequestSection from './RequestSection';
import StudentProfileCard from './StudentProfileCard';

const DRAWER_GRADE_COLORS = {
  9:  'bg-sky-100 text-sky-700',
  10: 'bg-violet-100 text-violet-700',
  11: 'bg-amber-100 text-amber-700',
  12: 'bg-emerald-100 text-emerald-700',
};

export default function StudentDrawer({ studentId, onClose, onCountChanged, onActiveChanged }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false); // drives the slide-in animation
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  // Trigger slide-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close with slide-out animation, then unmount
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // ESC key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  function load() {
    setLoading(true);
    getStudent(studentId)
      .then(setStudent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [studentId]);

  function handleUpdate(updated) {
    setStudent((prev) => {
      const requests = prev.requests.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
      onCountChanged(prev.id, requests.length);
      return { ...prev, requests };
    });
  }

  function handleDelete(reqId) {
    setStudent((prev) => {
      const requests = prev.requests.filter((r) => r.id !== reqId);
      onCountChanged(prev.id, requests.length);
      return { ...prev, requests };
    });
  }

  async function handleToggleActive() {
    if (!student) return;
    const newActive = !student.active;
    const label = newActive ? 'reactivate' : 'mark as inactive';
    if (!confirm(`${newActive ? 'Reactivate' : 'Mark'} ${student.name} as ${newActive ? 'active' : 'inactive'}?`)) return;
    setTogglingActive(true);
    try {
      await updateStudent(student.id, { active: newActive });
      setStudent((prev) => ({ ...prev, active: newActive }));
      onActiveChanged?.(student.id, newActive);
    } finally {
      setTogglingActive(false);
    }
  }

  async function handleAdd(courseCode, type, note) {
    await addRequest(studentId, courseCode, type, note);
    // Reload to get fully populated course details
    const fresh = await getStudent(studentId);
    setStudent(fresh);
    onCountChanged(studentId, fresh.requests.length);
  }

  const priorityRequests = student?.requests.filter((r) => r.type === 'priority') ?? [];
  const electiveRequests = student?.requests.filter((r) => r.type === 'elective') ?? [];
  const assignedCodes = student?.requests.map((r) => r.courseCode || r.course?.code) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          {student ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-slate-900 truncate">{student.name}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${DRAWER_GRADE_COLORS[student.grade] || 'bg-slate-100 text-slate-600'}`}>
                Grade {student.grade}
              </span>
            </div>
          ) : (
            <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
          )}
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {student && (
              <button
                onClick={() => { handleClose(); setTimeout(() => navigate(`/students/${student.id}`), 310); }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
              >
                Full view
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="m-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && student && !student.active && (
            <div className="mx-6 mt-4 flex items-center gap-2 bg-slate-100 border border-slate-300 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              This student is inactive and will not appear in the active roster.
            </div>
          )}

          {!loading && student && (
            <div className="p-6 space-y-5">
              {/* Profile card */}
              <StudentProfileCard
                student={student}
                compact
                onUpdated={(patch) => setStudent((prev) => ({ ...prev, ...patch }))}
              />

              {/* Add course button */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Course Requests</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Course
                </button>
              </div>

              {/* Request sections */}
              <RequestSection
                title="Priority Requests"
                type="priority"
                requests={priorityRequests}
                studentId={student.id}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                accentClass="bg-rose-50 text-rose-800"
              />
              <RequestSection
                title="Elective Requests"
                type="elective"
                requests={electiveRequests}
                studentId={student.id}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                accentClass="bg-indigo-50 text-indigo-800"
              />

              {/* Deactivate / reactivate */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleToggleActive}
                  disabled={togglingActive}
                  className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                    student.active
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-green-200 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {togglingActive
                    ? '…'
                    : student.active
                      ? 'Mark student as inactive'
                      : 'Reactivate student'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddCourseModal
          assignedCodes={assignedCodes}
          studentGrade={student?.grade}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
