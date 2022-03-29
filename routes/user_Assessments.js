const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findAssessments } = require('../middleware/find');
const calculateScore = require('../middleware/calculateScore');
const { UserAssessments, UserAnswer, Assessments, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const user_id = req.user.id;
  const user_Assessmentszes = await UserAssessments.findAll({
    where: { user_id: user_id },
    include: [{
      model: UserAnswer,
      //where: { user_Assessments_id: user_Assessments.id },
      required: false
    }]
  });
  res.send(user_Assessmentszes);
});

router.post('/', [auth, findAssessments, calculateScore], async (req, res) => {
  let user_Assessments = UserAssessments.build({
    score: req.score,
    time: req.body.time,
    user_id: req.user.id,
    Assessments_id: req.body.Assessments_id
  });

  return sequelize.transaction( t => {
    return user_Assessments.save({ transaction: t }).then( uq => {
        if (req.body.user_answers.length) {
          // * Possible problem: question_id pointed to wrong question by client *
          req.body.user_answers.forEach( a => { a.user_Assessments_id = uq.id });
          return UserAnswer.bulkCreate(req.body.user_answers, { transaction: t });
        }
        return user_Assessments;
      });
    }).then( result => {
      res.send(user_Assessments);
    }).catch( err =>  {
      res.status(400).send(err);
    });
});

router.get('/:id', auth, async (req, res) => {
  const user_Assessments_id = req.params.id;
  const user_Assessments = await UserAssessments.findById(user_Assessments_id, {
    include: {
      model: UserAnswer,
      where: { user_Assessments_id: user_Assessments_id },
      required: false
    }
  });
  if (!user_Assessments) {
    res.status(404).send('UserAssessments with submitted ID not found');
  } else {// Check for current user
    if (req.user.id !== user_Assessments.user_id) {
      res.status(403).send('Forbidden');
    } else {
      res.send(user_Assessments);
    }
  }
});

router.put('/:id', [auth, admin, findAssessments], async (req, res) => {
  let user_Assessments = await UserAssessments.findOne({ where: { id: req.params.id } });
  if (!user_Assessments) {
    return res.status(404).send('UserAssessments with submitted ID not found');
  } else if (req.user.id !== user_Assessments.user_id) {
    return res.status(403).send('Forbidden');
  }

  try {
    const updated_user_Assessments = await user_Assessments.update({
      score: req.body.score,
      time: req.body.time,
      user_id: req.user.id,
      Assessments_id: req.body.Assessments_id
    });
    res.send(updated_user_Assessments);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user_Assessments = await UserAssessments.findOne({ where: { id: req.params.id } });
  if (!user_Assessments) {
    res.status(404).send('UserAssessments ID not found');
  } else {
    await user_Assessments.destroy(); // Auto-deletes user-answers
    res.send(user_Assessments);
  }
});

module.exports = router;
