'use strict';

const { Student, Course, CourseRequest, sequelize } = require('../models');

async function getStudents() {
  return Student.findAll({
    attributes: ['id', 'name', 'grade', 'profile'],
    include: [
      {
        model: CourseRequest,
        as: 'requests',
        attributes: ['id'],
      },
    ],
    order: [['grade', 'ASC'], ['name', 'ASC']],
  });
}

async function getStudent(id) {
  return Student.findByPk(id, {
    include: [
      {
        model: CourseRequest,
        as: 'requests',
        include: [{ model: Course, as: 'course' }],
        order: [['type', 'ASC']],
      },
    ],
  });
}

async function createStudent({ name, grade, profile }) {
  // Auto-generate a sequential ID in the format S001, S002, …
  const count = await Student.count();
  const id = `S${String(count + 1).padStart(3, '0')}`;
  return Student.create({ id, name, grade: parseInt(grade, 10), profile: profile || '' });
}

async function getCourses() {
  return Course.findAll({ order: [['department', 'ASC'], ['code', 'ASC']] });
}

async function createCourse({ code, name, department, grades }) {
  return Course.create({ code, name, department, grades });
}

async function updateCourse(code, patch) {
  const course = await Course.findByPk(code);
  if (!course) throw new Error('Course not found');
  return course.update(patch);
}

async function deleteCourse(code) {
  const course = await Course.findByPk(code);
  if (!course) throw new Error('Course not found');
  await course.destroy();
}

async function addRequest(studentId, courseCode, type, note) {
  return CourseRequest.create({ studentId, courseCode, type, note: note || null });
}

async function updateRequest(reqId, patch) {
  const req = await CourseRequest.findByPk(reqId);
  if (!req) throw new Error('Request not found');
  return req.update(patch);
}

async function deleteRequest(reqId) {
  const req = await CourseRequest.findByPk(reqId);
  if (!req) throw new Error('Request not found');
  await req.destroy();
}

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addRequest,
  updateRequest,
  deleteRequest,
};
