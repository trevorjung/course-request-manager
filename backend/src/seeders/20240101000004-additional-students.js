'use strict';

const { v4: uuidv4 } = require('uuid');

const students = [
  {
    id: 'S011',
    name: 'Carlos Reyes',
    grade: 9,
    profile: 'First-generation college-bound student. Strong in science and math. Interested in engineering pathway. No academic flags.',
  },
  {
    id: 'S012',
    name: 'Anika Sharma',
    grade: 9,
    profile: 'Gifted student, completed pre-algebra in 8th grade. Recommend accelerated math placement. Active in drama and visual arts.',
  },
  {
    id: 'S013',
    name: 'DeShawn Miller',
    grade: 10,
    profile: 'Steady performer with strong writing skills. Considering journalism or communications. Encourage English electives.',
  },
  {
    id: 'S014',
    name: 'Yuki Tanaka',
    grade: 10,
    profile: 'Transfer student from Japan, second year in the US. English proficiency improving. Strong in math and computer science.',
  },
  {
    id: 'S015',
    name: 'Brianna Foster',
    grade: 11,
    profile: 'Returning from medical leave — missed part of sophomore year. Some credits pending review. Counselor should confirm course eligibility before assigning.',
  },
  {
    id: 'S016',
    name: 'Omar Hassan',
    grade: 11,
    profile: 'High achiever with interest in pre-med. Taking biology and chemistry on accelerated track. Plan AP sciences for senior year.',
  },
  {
    id: 'S017',
    name: 'Grace Kim',
    grade: 12,
    profile: 'Strong all-around student. Applying to music conservatories — ensure Music Theory and electives are prioritized. On track for graduation.',
  },
  {
    id: 'S018',
    name: 'Tyler Brooks',
    grade: 12,
    profile: 'Needs two more credits to meet graduation requirements. Counselor must confirm core completions before finalizing requests. At-risk of not graduating on time.',
  },
];

const requests = [
  // S011 - Carlos Reyes (9th)
  { studentId: 'S011', courseCode: 'MTH101', type: 'priority' },
  { studentId: 'S011', courseCode: 'ENG101', type: 'priority' },
  { studentId: 'S011', courseCode: 'SS101',  type: 'priority' },
  { studentId: 'S011', courseCode: 'SCI101', type: 'priority' },
  { studentId: 'S011', courseCode: 'AT101',  type: 'elective' },

  // S012 - Anika Sharma (9th, accelerated)
  { studentId: 'S012', courseCode: 'MTH102', type: 'priority', note: 'Accelerated placement' },
  { studentId: 'S012', courseCode: 'ENG101', type: 'priority' },
  { studentId: 'S012', courseCode: 'SS101',  type: 'priority' },
  { studentId: 'S012', courseCode: 'SCI101', type: 'priority' },
  { studentId: 'S012', courseCode: 'AT102',  type: 'elective' },

  // S013 - DeShawn Miller (10th)
  { studentId: 'S013', courseCode: 'MTH201', type: 'priority' },
  { studentId: 'S013', courseCode: 'ENG201', type: 'priority' },
  { studentId: 'S013', courseCode: 'SS201',  type: 'priority' },
  { studentId: 'S013', courseCode: 'SCI201', type: 'priority' },
  { studentId: 'S013', courseCode: 'ENG302', type: 'elective' },

  // S014 - Yuki Tanaka (10th, ELL)
  { studentId: 'S014', courseCode: 'MTH201', type: 'priority' },
  { studentId: 'S014', courseCode: 'ENG201', type: 'priority' },
  { studentId: 'S014', courseCode: 'SS201',  type: 'priority' },
  { studentId: 'S014', courseCode: 'SCI201', type: 'priority' },
  { studentId: 'S014', courseCode: 'AT101',  type: 'elective' },

  // S015 - Brianna Foster (11th, pending review — minimal requests)
  { studentId: 'S015', courseCode: 'ENG301', type: 'priority', note: 'Pending credit review' },
  { studentId: 'S015', courseCode: 'SS301',  type: 'priority', note: 'Pending credit review' },

  // S016 - Omar Hassan (11th, pre-med track)
  { studentId: 'S016', courseCode: 'MTH202', type: 'priority' },
  { studentId: 'S016', courseCode: 'ENG301', type: 'priority' },
  { studentId: 'S016', courseCode: 'SS301',  type: 'priority' },
  { studentId: 'S016', courseCode: 'SCI301', type: 'priority' },
  { studentId: 'S016', courseCode: 'SCI302', type: 'elective' },

  // S017 - Grace Kim (12th, music)
  { studentId: 'S017', courseCode: 'MTH302', type: 'priority' },
  { studentId: 'S017', courseCode: 'ENG401', type: 'priority' },
  { studentId: 'S017', courseCode: 'SS402',  type: 'priority' },
  { studentId: 'S017', courseCode: 'AT202',  type: 'priority' },
  { studentId: 'S017', courseCode: 'AT302',  type: 'elective' },

  // S018 - Tyler Brooks (12th, at-risk graduation)
  { studentId: 'S018', courseCode: 'ENG403', type: 'priority', note: 'Required for graduation' },
  { studentId: 'S018', courseCode: 'SS402',  type: 'priority', note: 'Required for graduation' },
  { studentId: 'S018', courseCode: 'SCI403', type: 'elective' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'Students',
      students.map((s) => ({ ...s, active: true, createdAt: now, updatedAt: now })),
      { ignoreDuplicates: true }
    );
    await queryInterface.bulkInsert(
      'CourseRequests',
      requests.map((r) => ({ id: uuidv4(), ...r, createdAt: now, updatedAt: now })),
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    const ids = students.map((s) => s.id);
    await queryInterface.bulkDelete('CourseRequests', { studentId: ids }, {});
    await queryInterface.bulkDelete('Students', { id: ids }, {});
  },
};
