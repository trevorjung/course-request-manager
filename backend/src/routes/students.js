'use strict';

const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/', async (req, res) => {
  try {
    const students = await dataService.getStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, grade, profile } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: 'name and grade are required' });
    }
    if (![9, 10, 11, 12].includes(parseInt(grade, 10))) {
      return res.status(400).json({ error: 'grade must be 9, 10, 11, or 12' });
    }
    const student = await dataService.createStudent({ name, grade, profile });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await dataService.getStudent(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/requests', async (req, res) => {
  try {
    const { courseCode, type, note } = req.body;
    if (!courseCode || !type) {
      return res.status(400).json({ error: 'courseCode and type are required' });
    }
    if (!['priority', 'elective'].includes(type)) {
      return res.status(400).json({ error: 'type must be "priority" or "elective"' });
    }
    const request = await dataService.addRequest(req.params.id, courseCode, type, note);
    res.status(201).json(request);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'This course is already assigned to the student' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/requests/:reqId', async (req, res) => {
  try {
    const { type, note } = req.body;
    const patch = {};
    if (type !== undefined) {
      if (!['priority', 'elective'].includes(type)) {
        return res.status(400).json({ error: 'type must be "priority" or "elective"' });
      }
      patch.type = type;
    }
    if (note !== undefined) patch.note = note;
    const updated = await dataService.updateRequest(req.params.reqId, patch);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Request not found') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/requests/:reqId', async (req, res) => {
  try {
    await dataService.deleteRequest(req.params.reqId);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'Request not found') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
