import { useEffect, useState } from 'react';
import { getCourses } from '../services/api';

const DEPT_COLORS = {
  'Math':          'bg-blue-100 text-blue-700',
  'English':       'bg-purple-100 text-purple-700',
  'Social Studies':'bg-orange-100 text-orange-700',
  'Science':       'bg-green-100 text-green-700',
  'Arts & Tech':   'bg-pink-100 text-pink-700',
};

/** Returns true if the student's grade is listed in a course's grades string (e.g. "11/12", "9", "10/11") */
function gradeMatches(gradesStr, studentGrade) {
  return gradesStr.split('/').map(Number).includes(studentGrade);
}

export default function AddCourseModal({ assignedCodes, studentGrade, onAdd, onClose }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [type, setType] = useState('priority');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
  }, []);

  const unassigned = courses.filter((c) => !assignedCodes.includes(c.code));

  const suggested = unassigned.filter((c) => gradeMatches(c.grades, studentGrade));

  const searchResults = search
    ? unassigned.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.department.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const selected = courses.find((c) => c.code === selectedCode);

  function selectCourse(course) {
    setSelectedCode(course.code);
    setSearch(course.name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCode) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd(selectedCode, type, note || undefined);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Add Course Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Suggested courses */}
            {suggested.length > 0 && !selectedCode && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Suggested for Grade {studentGrade}
                </p>
                <div className="space-y-1.5">
                  {suggested.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCourse(c)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left group"
                    >
                      <div>
                        <span className="font-mono text-xs text-slate-400 mr-2">{c.code}</span>
                        <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-700">{c.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${DEPT_COLORS[c.department] || 'bg-slate-100 text-slate-600'}`}>
                        {c.department}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-slate-400">or search all courses</span></div>
                </div>
              </div>
            )}

            {/* Course search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
              <input
                type="text"
                placeholder="Search by name, code, or department…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedCode(''); }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {search && !selectedCode && searchResults.length > 0 && (
                <ul className="mt-1 border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 shadow-sm">
                  {searchResults.map((c) => (
                    <li
                      key={c.code}
                      className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between gap-3"
                      onClick={() => selectCourse(c)}
                    >
                      <div>
                        <span className="font-mono text-xs text-slate-500 mr-2">{c.code}</span>
                        <span className="text-sm text-slate-900">{c.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${DEPT_COLORS[c.department] || 'bg-slate-100 text-slate-600'}`}>
                        {c.department}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {search && !selectedCode && searchResults.length === 0 && (
                <p className="mt-1 text-xs text-slate-400 px-1">No courses found</p>
              )}
              {selected && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{selected.code}</span>
                  <span>{selected.department}</span>
                  <span>·</span>
                  <span>Grades {selected.grades}</span>
                </div>
              )}
            </div>

            {/* Request type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Request Type</label>
              <div className="flex gap-3">
                {['priority', 'elective'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      type === t
                        ? t === 'priority'
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Retake, ELL Support, Accelerated…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedCode || saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Adding…' : 'Add Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
