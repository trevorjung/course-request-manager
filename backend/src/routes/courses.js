'use strict';

const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

function validateGrades(grades) {
  const parts = String(grades).trim().split('/');
  if (parts.length > 2) return 'Use at most two grades separated by a slash (e.g. 11/12)';
  for (const part of parts) {
    const n = Number(part.trim());
    if (!Number.isInteger(n) || n < 9 || n > 12) {
      return `"${part.trim()}" is not a valid grade — must be 9, 10, 11, or 12`;
    }
  }
  if (parts.length === 2 && Number(parts[0]) >= Number(parts[1])) {
    return 'When specifying a range, the lower grade must come first (e.g. 11/12)';
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const courses = await dataService.getCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, name, department, grades } = req.body;
    if (!code || !name || !department || !grades) {
      return res.status(400).json({ error: 'code, name, department, and grades are required' });
    }
    const gradesErr = validateGrades(grades);
    if (gradesErr) return res.status(400).json({ error: gradesErr });
    const course = await dataService.createCourse({ code, name, department, grades });
    res.status(201).json(course);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A course with that code already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:code', async (req, res) => {
  try {
    const { name, department, grades } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (department !== undefined) patch.department = department;
    if (grades !== undefined) {
      const gradesErr = validateGrades(grades);
      if (gradesErr) return res.status(400).json({ error: gradesErr });
      patch.grades = grades;
    }
    const updated = await dataService.updateCourse(req.params.code, patch);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Course not found') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    await dataService.deleteCourse(req.params.code);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'Course not found') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
