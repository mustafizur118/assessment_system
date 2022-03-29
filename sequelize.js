const config = require('config');
const db = config.get('db');

const Sequelize = require('sequelize');
const UserModel = require('./models/user');
const UserAssessmentModel = require('./models/user_Assessment');
const UserAnswerModel = require('./models/user_answer');
const AssessmentModel = require('./models/Assessment');
const CategoryModel = require('./models/category');
const QuestionModel = require('./models/question');
let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres'
  });
} else {
  sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: db
  });
}

const User = UserModel(sequelize, Sequelize);
const UserAssessment = UserAssessmentModel(sequelize, Sequelize);
const UserAnswer = UserAnswerModel(sequelize, Sequelize);
const Assessment = AssessmentModel(sequelize, Sequelize);
const Category = CategoryModel(sequelize, Sequelize);
const Question = QuestionModel(sequelize, Sequelize);

User.hasMany(UserAssessment);
Assessment.hasMany(UserAssessment);
Assessment.hasMany(Question, {onDelete: 'cascade'});
Category.hasMany(Assessment);
UserAssessment.hasMany(UserAnswer, {onDelete: 'cascade'});
Question.hasMany(UserAnswer);

sequelize.sync().then(() => {
  console.log("Database and tables created");
});

module.exports = {
  User,
  UserAssessment,
  UserAnswer,
  Assessment,
  Category,
  Question,
  sequelize
};
