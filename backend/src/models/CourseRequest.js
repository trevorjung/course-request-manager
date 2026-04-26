'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CourseRequest extends Model {
    static associate(models) {
      CourseRequest.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
      CourseRequest.belongsTo(models.Course, { foreignKey: 'courseCode', as: 'course' });
    }
  }

  CourseRequest.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('priority', 'elective'),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CourseRequest',
    }
  );

  return CourseRequest;
};
