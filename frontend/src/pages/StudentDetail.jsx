import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, addRequest } from '../services/api';
import AddCourseModal from '../components/AddCourseModal';
import RequestSection from '../components/RequestSection';
import StudentProfileCard from '../components/StudentProfileCard';

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

      <div className="mb-6">
        <StudentProfileCard
          student={student}
          onUpdated={(patch) => setStudent((prev) => ({ ...prev, ...patch }))}
        />
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
