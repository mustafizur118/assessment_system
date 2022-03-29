const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findCategory } = require('../middleware/find');
const { Assessments, Question, Category } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const Assessmentszes = await Assessments.findAll();
  res.send(Assessmentszes);
});

router.post('/', [auth, admin, findCategory], async (req, res) => {
  try {
    const Assessments = await Assessments.create({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.category.id
    });
    res.send(Assessments);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  let Assessments;
  const id = req.params.id;

  if (req.user.admin === false) {
    Assessments = await Assessments.findById(id, {
      include: {
        model: Question,
        where: { Assessments_id: id },
        attributes: ['id','question'],
        required: false
      }
    });
  } else {
    Assessments = await Assessments.findById(id, {
      include: {
        model: Question,
        where: { Assessments_id: id },
        required: false
      }
    });
  }

  if (!Assessments) {
    res.status(404).send('Assessments with submitted ID not found');
  } else {
    res.send(Assessments);
  }
});

router.put('/:id', [auth, admin, findCategory], async (req, res) => {
  const Assessments = await Assessments.findOne({ where: { id: req.params.id } });
  if (!Assessments) return res.status(404).send('Assessments with submitted ID not found');

  try {
    const updated_Assessments = await Assessments.update({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.category.id
    });
    res.send(updated_Assessments);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const Assessments = await Assessments.findOne({ where: { id: req.params.id } });
  if (!Assessments) return res.status(404).send('Assessments ID not found');

  await Assessments.destroy(); // Auto-deletes questions
  res.send(Assessments);
});

module.exports = router;
