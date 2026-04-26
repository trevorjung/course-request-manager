import { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../services/api';

const DEPARTMENTS = ['Math', 'English', 'Social Studies', 'Science', 'Arts & Tech'];

const DEPT_COLORS = {
  'Math':          'bg-blue-100 text-blue-700',
  'English':       'bg-purple-100 text-purple-700',
  'Social Studies':'bg-orange-100 text-orange-700',
  'Science':       'bg-green-100 text-green-700',
  'Arts & Tech':   'bg-pink-100 text-pink-700',
};

const EMPTY_FORM = { code: '', name: '', department: 'Math', grades: '' };

function CourseFormModal({ course, onSave, onClose }) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState(
    course ? { code: course.code, name: course.name, department: course.department, grades: course.grades }
           : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MTH501"
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                disabled={isEdit}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Grade(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9 or 11/12"
                value={form.grades}
                onChange={(e) => update('grades', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Statistics"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | { course }

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchesDept = !deptFilter || c.department === deptFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  async function handleAdd(form) {
    const course = await createCourse(form);
    setCourses((prev) => [...prev, course].sort((a, b) =>
      a.department.localeCompare(b.department) || a.code.localeCompare(b.code)
    ));
  }

  async function handleEdit(form) {
    const updated = await updateCourse(form.code, {
      name: form.name,
      department: form.department,
      grades: form.grades,
    });
    setCourses((prev) => prev.map((c) => (c.code === updated.code ? updated : c)));
  }

  async function handleDelete(code) {
    const course = courses.find((c) => c.code === code);
    if (!confirm(`Delete ${code} – ${course?.name}?\n\nThis will also remove it from any student requests.`)) return;
    await deleteCourse(code);
    setCourses((prev) => prev.filter((c) => c.code !== code));
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
        <p className="font-medium">Failed to load courses</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Course Catalog</h2>
          <p className="text-slate-500 mt-1">{courses.length} courses across {DEPARTMENTS.length} departments</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by code or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Code</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Course Name</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Department</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Grades</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No courses match your search
                </td>
              </tr>
            )}
            {filtered.map((course) => (
              <tr key={course.code} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-3">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-slate-900">{course.name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DEPT_COLORS[course.department] || 'bg-slate-100 text-slate-600'}`}>
                    {course.department}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{course.grades}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ course })}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.code)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'add' && (
        <CourseFormModal onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal?.course && (
        <CourseFormModal course={modal.course} onSave={handleEdit} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
