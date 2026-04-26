'use strict';

const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

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
    if (grades !== undefined) patch.grades = grades;
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
