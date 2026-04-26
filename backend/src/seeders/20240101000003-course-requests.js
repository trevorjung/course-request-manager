'use strict';

const { v4: uuidv4 } = require('uuid');

const requests = [
  // S001 - Alex Rivera (9th)
  { studentId: 'S001', courseCode: 'MTH101', type: 'priority' },
  { studentId: 'S001', courseCode: 'ENG101', type: 'priority' },
  { studentId: 'S001', courseCode: 'SS101',  type: 'priority' },
  { studentId: 'S001', courseCode: 'SCI101', type: 'priority' },
  { studentId: 'S001', courseCode: 'AT101',  type: 'elective' },

  // S002 - Mei Chen (9th, ELL)
  { studentId: 'S002', courseCode: 'MTH101', type: 'priority' },
  { studentId: 'S002', courseCode: 'ENG101', type: 'priority' },
  { studentId: 'S002', courseCode: 'ENG102', type: 'priority', note: 'ELL Support' },
  { studentId: 'S002', courseCode: 'SS101',  type: 'priority' },
  { studentId: 'S002', courseCode: 'SCI101', type: 'priority' },

  // S003 - Jordan Williams (10th, MTH101 retake)
  { studentId: 'S003', courseCode: 'MTH101', type: 'priority', note: 'Retake' },
  { studentId: 'S003', courseCode: 'ENG201', type: 'priority' },
  { studentId: 'S003', courseCode: 'SS201',  type: 'priority' },
  { studentId: 'S003', courseCode: 'SCI201', type: 'priority' },
  { studentId: 'S003', courseCode: 'AT201',  type: 'elective' },

  // S004 - Priya Patel (10th, accelerated)
  { studentId: 'S004', courseCode: 'MTH201', type: 'priority', note: 'Accelerated' },
  { studentId: 'S004', courseCode: 'ENG201', type: 'priority' },
  { studentId: 'S004', courseCode: 'SS201',  type: 'priority' },
  { studentId: 'S004', courseCode: 'SCI201', type: 'priority' },
  { studentId: 'S004', courseCode: 'AT301',  type: 'elective', note: 'Early AP' },

  // S005 - Marcus Thompson (11th, arts/media)
  { studentId: 'S005', courseCode: 'MTH202', type: 'priority' },
  { studentId: 'S005', courseCode: 'ENG301', type: 'priority' },
  { studentId: 'S005', courseCode: 'SS301',  type: 'priority' },
  { studentId: 'S005', courseCode: 'SCI301', type: 'priority' },
  { studentId: 'S005', courseCode: 'AT302',  type: 'elective' },
  { studentId: 'S005', courseCode: 'AT303',  type: 'elective' },

  // S006 - Sofia Mendez (11th, multiple APs)
  { studentId: 'S006', courseCode: 'MTH401', type: 'priority' },
  { studentId: 'S006', courseCode: 'ENG401', type: 'priority' },
  { studentId: 'S006', courseCode: 'SS401',  type: 'priority' },
  { studentId: 'S006', courseCode: 'SCI401', type: 'priority' },
  { studentId: 'S006', courseCode: 'AT301',  type: 'elective' },

  // S007 - Ethan Park (11th, science/medicine track)
  { studentId: 'S007', courseCode: 'MTH202', type: 'priority' },
  { studentId: 'S007', courseCode: 'ENG301', type: 'priority' },
  { studentId: 'S007', courseCode: 'SS301',  type: 'priority' },
  { studentId: 'S007', courseCode: 'SCI301', type: 'priority' },
  { studentId: 'S007', courseCode: 'SS302',  type: 'elective' },

  // S008 - Aisha Johnson (12th)
  { studentId: 'S008', courseCode: 'MTH302', type: 'priority' },
  { studentId: 'S008', courseCode: 'ENG401', type: 'priority' },
  { studentId: 'S008', courseCode: 'SS402',  type: 'priority' },
  { studentId: 'S008', courseCode: 'SCI403', type: 'elective' },
  { studentId: 'S008', courseCode: 'SS403',  type: 'elective' },

  // S009 - Liam O'Brien (12th, full AP)
  { studentId: 'S009', courseCode: 'MTH401', type: 'priority' },
  { studentId: 'S009', courseCode: 'ENG402', type: 'priority' },
  { studentId: 'S009', courseCode: 'SS402',  type: 'priority' },
  { studentId: 'S009', courseCode: 'SCI402', type: 'priority' },
  { studentId: 'S009', courseCode: 'AT301',  type: 'elective' },

  // S010 - Nina Torres (12th, transfer — placeholder requests)
  { studentId: 'S010', courseCode: 'ENG403', type: 'priority', note: 'TBD pending transcript review' },
  { studentId: 'S010', courseCode: 'SCI403', type: 'elective', note: 'TBD pending transcript review' },
  { studentId: 'S010', courseCode: 'SS302',  type: 'elective', note: 'TBD pending transcript review' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'CourseRequests',
      requests.map((r) => ({ id: uuidv4(), ...r, createdAt: now, updatedAt: now })),
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('CourseRequests', null, {});
  },
};
