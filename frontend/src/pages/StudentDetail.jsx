import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, addRequest } from '../services/api';
import AddCourseModal from '../components/AddCourseModal';
import RequestSection from '../components/RequestSection';

const GRADE_COLORS = {
  9:  'bg-sky-100 text-sky-700',
  10: 'bg-violet-100 text-violet-700',
  11: 'bg-amber-100 text-amber-700',
  12: 'bg-emerald-100 text-emerald-700',
};

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  function load() {
    setLoading(true);
    getStudent(id)
      .then(setStudent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  function handleUpdate(updated) {
    setStudent((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
    }));
  }

  function handleDelete(reqId) {
    setStudent((prev) => ({
      ...prev,
      requests: prev.requests.filter((r) => r.id !== reqId),
    }));
  }

  async function handleAdd(courseCode, type, note) {
    await addRequest(id, courseCode, type, note);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
        <p className="font-medium">Failed to load student</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const priorityRequests = student.requests.filter((r) => r.type === 'priority');
  const electiveRequests = student.requests.filter((r) => r.type === 'elective');
  const assignedCodes = student.requests.map((r) => r.courseCode || r.course?.code);

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Students
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[student.grade] || 'bg-slate-100 text-slate-600'}`}>
                Grade {student.grade}
              </span>
              <span className="text-xs text-slate-400 font-mono">{student.id}</span>
            </div>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">{student.profile}</p>
          </div>
          <div className="flex items-center gap-2 text-sm shrink-0">
            <div className="text-center px-4 py-2 bg-rose-50 rounded-lg border border-rose-100">
              <div className="text-xl font-bold text-rose-600">{priorityRequests.length}</div>
              <div className="text-xs text-rose-500 font-medium">Priority</div>
            </div>
            <div className="text-center px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-xl font-bold text-indigo-600">{electiveRequests.length}</div>
              <div className="text-xs text-indigo-500 font-medium">Elective</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Course Requests</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Course
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      {showModal && (
        <AddCourseModal
          assignedCodes={assignedCodes}
          studentGrade={student.grade}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
