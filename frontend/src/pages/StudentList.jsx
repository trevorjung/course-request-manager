import { useEffect, useState } from 'react';
import { getStudents } from '../services/api';
import CreateStudentModal from '../components/CreateStudentModal';
import StudentDrawer from '../components/StudentDrawer';
import Tooltip from '../components/Tooltip';

const GRADE_COLORS = {
  9:  'bg-sky-100 text-sky-700',
  10: 'bg-violet-100 text-violet-700',
  11: 'bg-amber-100 text-amber-700',
  12: 'bg-emerald-100 text-emerald-700',
};

function getSchoolYear() {
  const now = new Date();
  // Upcoming school year: after June the next cycle begins
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}–${year + 1}`;
}

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState(null);

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchesGrade = !gradeFilter || String(s.grade) === gradeFilter;
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  function handleCreated(student) {
    setStudents((prev) =>
      [...prev, { ...student, requests: [] }].sort(
        (a, b) => a.grade - b.grade || a.name.localeCompare(b.name)
      )
    );
    setActiveStudentId(student.id);
  }

  function handleCountChanged(studentId, count) {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, requests: Array.from({ length: count }) }
          : s
      )
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
        <p className="font-medium">Failed to load students</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Student Roster</h2>
            <span className="text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {getSchoolYear()}
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            {filtered.length} of {students.length} students
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Grades</option>
          {[9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
        {(search || gradeFilter) && (
          <button
            onClick={() => { setSearch(''); setGradeFilter(''); }}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Student</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Grade</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Profile</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600">Requests</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No students match your filters
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr
                key={student.id}
                className={`hover:bg-slate-50 transition-colors cursor-pointer ${activeStudentId === student.id ? 'bg-indigo-50/50' : ''}`}
                onClick={() => setActiveStudentId(student.id)}
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{student.name}</div>
                  <div className="text-xs text-slate-400">{student.id}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[student.grade] || 'bg-slate-100 text-slate-600'}`}>
                    Grade {student.grade}
                  </span>
                </td>
                <td className="px-5 py-4 max-w-xs">
                  <Tooltip content={student.profile}>
                    <p className="text-slate-600 truncate max-w-[280px]">
                      {student.profile || <span className="text-slate-300 italic">No notes</span>}
                    </p>
                  </Tooltip>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${student.requests?.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                    {student.requests?.length ?? 0}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                    onClick={(e) => { e.stopPropagation(); setActiveStudentId(student.id); }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateStudentModal
          onCreated={handleCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {activeStudentId && (
        <StudentDrawer
          studentId={activeStudentId}
          onClose={() => setActiveStudentId(null)}
          onCountChanged={handleCountChanged}
        />
      )}
    </div>
  );
}
