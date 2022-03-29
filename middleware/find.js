const { User, UserAssessments, UserAnswer,
        Assessments, Category, Question } = require('../sequelize');

async function findCategory(req, res, next) {
  const category = await Category.findById(req.body.category_id);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }
  req.category = category;
  next();
}

async function findAssessments(req, res, next) {
  const Assessments_id = req.params.AssessmentsId ? req.params.AssessmentsId : req.body.Assessments_id;
  const Assessments = await Assessments.findById(Assessments_id, {
    include: {
      model: Question,
      where: { Assessments_id: Assessments_id },
      required: false
    }
  });
  if (!Assessments) {
    return res.status(400).send('Invalid Assessments');
  }
  req.Assessments = Assessments;
  next();
}

async function findQuestion(req, res, next) {
  const question = await Question.findById(req.body.question_id);
  if (!question) {
    return res.status(400).send('Invalid Question');
  }
  req.question = question;
  next();
}

async function findUserAssessments(req, res, next) {
  const user_Assessments = await UserAssessments.findById(req.params.userAssessmentsId);
  if (!user_Assessments) {
    return res.status(400).send('Invalid User Assessments');
  }
  req.user_Assessments = user_Assessments;
  next();
}

module.exports = {
  findCategory,
  findAssessments,
  findQuestion,
  findUserAssessments
};
