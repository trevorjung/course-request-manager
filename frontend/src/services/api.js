const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Students
export const getStudents = () => request('/students');
export const getStudent = (id) => request(`/students/${id}`);
export const createStudent = (data) =>
  request('/students', { method: 'POST', body: data });
export const updateStudent = (id, patch) =>
  request(`/students/${id}`, { method: 'PATCH', body: patch });

// Courses
export const getCourses = () => request('/courses');
export const createCourse = (data) =>
  request('/courses', { method: 'POST', body: data });
export const updateCourse = (code, patch) =>
  request(`/courses/${code}`, { method: 'PATCH', body: patch });
export const deleteCourse = (code) =>
  request(`/courses/${code}`, { method: 'DELETE' });

// Course requests
export const addRequest = (studentId, courseCode, type, note) =>
  request(`/students/${studentId}/requests`, {
    method: 'POST',
    body: { courseCode, type, note },
  });
export const updateRequest = (studentId, reqId, patch) =>
  request(`/students/${studentId}/requests/${reqId}`, {
    method: 'PATCH',
    body: patch,
  });
export const deleteRequest = (studentId, reqId) =>
  request(`/students/${studentId}/requests/${reqId}`, { method: 'DELETE' });
