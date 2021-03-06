const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findAssessments } = require('../middleware/find');
const { Question, Assessments } = require('../sequelize');
const prefix = "/:AssessmentsId/questions";

router.get(`${prefix}/`, [auth, admin, findAssessments], async (req, res) => {
  const questions = await Question.findAll({
    where: { Assessments_id: req.params.AssessmentsId }
  });
  res.send(questions);
});

router.post(`${prefix}/`, [auth, admin, findAssessments], async (req, res) => {
  try {
    const question = await Question.create({
      Assessments_id: req.params.AssessmentsId,
      question: req.body.question,
      answer: req.body.answer
    });
    res.send(question);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get(`${prefix}/:id`, [auth, admin, findAssessments], async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).send('Question with submitted ID not found');
  }
  res.send(question);
});

router.put(`${prefix}/:id`, [auth, admin, findAssessments], async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).send('Question with submitted ID not found');
  }
  try {
    const updated_question = await question.update({
      question: req.body.question,
      answer: req.body.answer
    });
    res.send(updated_question);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(`${prefix}/:id`, [auth, admin, findAssessments], async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).send('Question with submitted ID not found');
  }
  await question.destroy();
  res.send(question);
});

module.exports = router;
