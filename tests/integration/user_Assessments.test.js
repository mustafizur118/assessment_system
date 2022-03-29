const { UserAssessments, Assessments, User, UserAnswer, Question, Category, sequelize } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/user-Assessmentszes', () => {
  afterEach(async () => {
    await UserAssessments.destroy({ where: {} });
    await Assessments.destroy({ where: {} });
    await User.destroy({ where: {} });
    await UserAnswer.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Question.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, category, Assessments_1, Assessments_2,
    user_Assessments_1, user_Assessments_2, other_user_Assessments, user_answers;

    const response = async (jwt) => {
      return await request
        .get('/api/user-Assessmentszes')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "mentor",
        email: "mentor@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      Assessments_1 = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      Assessments_2 = await Assessments.create({
        title: 'Continents',
        description: 'Test your Geography Knowledge',
        difficulty: 10,
        category_id: category.id
      });
      const question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      const question_2 = await Question.create({
        question: 'Which is the largest continent?',
        answer: 'Asia'
      });
      user_Assessments_1 = await UserAssessments.create({
        score: 1.00,
        time: 20.00,
        Assessments_id: Assessments_1.id,
        user_id: user.id
      });
      user_Assessments_2 = await UserAssessments.create({
        score: 0.00,
        time: 15.00,
        Assessments_id: Assessments_2.id,
        user_id: user.id
      });
      other_user_Assessments = await UserAssessments.create({
        score: 1.00,
        time: 19.00,
        Assessments_id: Assessments_2.id,
        user_id: other_user.id
      });

      await UserAnswer.bulkCreate([
        {
          answer: 'Moo!',
          correct: true,
          user_Assessments_id: user_Assessments_1.id,
          question_id: question_1.id
        },
        {
          answer: 'America',
          correct: false,
          user_Assessments_id: user_Assessments_2.id,
          question_id: question_2.id
        },
        {
          answer: 'Asia',
          correct: true,
          user_Assessments_id: other_user_Assessments.id,
          question_id: question_2.id
        }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it(`should return all user Assessmentszes and associated user_answers
        for current user only (stat code 200)`, async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.some(uq => uq.id === user_Assessments_1.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === user_Assessments_2.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === other_user_Assessments.id)).toBeFalsy();

      expect(res.body.some(uq => uq.score === user_Assessments_1.score)).toBeTruthy();
      expect(res.body.some(uq => uq.score === user_Assessments_2.score)).toBeTruthy();

      expect(res.body.some(uq => uq.time === user_Assessments_1.time)).toBeTruthy();
      expect(res.body.some(uq => uq.time === user_Assessments_2.time)).toBeTruthy();
      expect(res.body.some(uq => uq.time === other_user_Assessments.time)).toBeFalsy();

      expect(res.body.some(uq => uq.Assessments_id === user_Assessments_1.Assessments_id)).toBeTruthy();
      expect(res.body.some(uq => uq.Assessments_id === user_Assessments_2.Assessments_id)).toBeTruthy();

      expect(res.body.some(uq => uq.user_id === user_Assessments_1.user_id)).toBeTruthy();
      expect(res.body.some(uq => uq.user_id === user_Assessments_2.user_id)).toBeTruthy();
      expect(res.body.some(uq => uq.user_id === other_user_Assessments.user_id)).toBeFalsy();

      expect(res.body.some(uq => uq.user_answers.length === 1)).toBeTruthy();

      expect(res.body.length).toBe(2);
    });
  });

  describe('POST /', () => {
    let user, token, user_Assessments_object, Assessments, question_1, question_2;

    const response = async (object, jwt) => {
      return await request
        .post('/api/user-Assessmentszes')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "mentor",
        email: "mentor@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!',
        Assessments_id: Assessments.id
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!',
        Assessments_id: Assessments.id
      });
      user_Assessments_object = {
        time: 12.34,
        Assessments_id: Assessments.id,
        user_id: user.id,
        user_answers: [
          { question_id: question_1.id, answer: "Moo!" },
          { question_id: question_2.id, answer: "Meow!" }
        ]
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid Assessments ID', async () => {
      user_Assessments_object.Assessments_id = 'id';
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      user_Assessments_object.Assessments_id = '10000';
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user_Assessments is invalid', async () => {
      user_Assessments_object = {
        Assessments_id: Assessments.id,
        user_id: user.id,
        user_answers: []
      };
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if any user_answer is invalid', async () => {
      user_Assessments_object = {
        time: 12.34,
        Assessments_id: Assessments.id,
        user_id: user.id,
        user_answers: [
          { question_id: question_1.id, answer: "Moo!" },
          { }
        ]
      };
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should save user_Assessments and user_answers if they are valid', async () => {
      const res = await response(user_Assessments_object, token);
      const user_Assessments = await UserAssessments.findOne({ where: { time: 12.34 } });
      const user_answer_1 = await UserAnswer.findOne({ where: { answer: "Moo!" } });
      const user_answer_2 = await UserAnswer.findOne({ where: { answer: "Meow!" } });

      expect(user_Assessments).toHaveProperty('id');
      expect(user_Assessments).toHaveProperty('score', 0.50);
      expect(user_Assessments).toHaveProperty('time', 12.34);
      expect(user_Assessments).toHaveProperty('Assessments_id', Assessments.id);
      expect(user_Assessments).toHaveProperty('user_id', user.id);

      expect(user_answer_1).toHaveProperty('answer', 'Moo!');
      expect(user_answer_1).toHaveProperty('correct', true);
      expect(user_answer_1).toHaveProperty('question_id', question_1.id);

      expect(user_answer_2).toHaveProperty('answer', 'Meow!');
      expect(user_answer_2).toHaveProperty('correct', false);
      expect(user_answer_2).toHaveProperty('question_id', question_2.id);
    });

    it('should return user_Assessments if user_Assessments is valid', async () => {
      const res = await response(user_Assessments_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 12.34);
      expect(res.body).toHaveProperty('Assessments_id', Assessments.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, category, Assessments,
    user_Assessments, other_user_Assessments, user_answers,
    question_1, question_2;

    const response = async (uq_id, jwt) => {
      return await request
        .get('/api/user-Assessmentszes/' + uq_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "mentor",
        email: "mentor@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!'
      });
      user_Assessments = await UserAssessments.create({
        score: 0.50,
        time: 20.00,
        Assessments_id: Assessments.id,
        user_id: user.id
      });
      other_user_Assessments = await UserAssessments.create({
        score: 1.00,
        time: 19.00,
        Assessments_id: Assessments.id,
        user_id: other_user.id
      });
      user_answers = [
        {
          user_Assessments_id: user_Assessments.id,
          answer: "Moo!",
          correct: true,
          question_id: question_1.id
        },
        {
          user_Assessments_id: user_Assessments.id,
          answer: "Meow!",
          correct: false,
          question_id: question_2.id
        },
        {
          user_Assessments_id: other_user_Assessments.id,
          answer: "Oink!",
          correct: true,
          question_id: question_2.id
        }
      ];
      await UserAnswer.bulkCreate(user_answers);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_Assessments.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(other_user_Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid user_Assessments ID', async () => {
      const user_Assessments_id = 'id';
      const res = await response(user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_Assessments ID valid but user_Assessments ID not in DB', async () => {
      const user_Assessments_id = '10000';
      const res = await response(user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return user_Assessments and all associated user_answers (stat code 200)', async () => {
      const res = await response(user_Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_Assessments.id);
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 20.00);
      expect(res.body).toHaveProperty('Assessments_id', Assessments.id);
      expect(res.body).toHaveProperty('user_id', user.id);

      expect(res.body.user_answers.length).toBe(2);
      expect(res.body.user_answers.some(ua => ua.user_Assessments_id === user_Assessments.id)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.answer === 'Moo!')).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.correct === true)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.question_id === question_1.id)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.answer === 'Meow!')).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.correct === false)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.question_id === question_2.id)).toBeTruthy();
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, Assessments, user_Assessments_object,
    user_Assessments, other_user_Assessments;

    const response = async (object, uq_id, jwt) => {
      return await request
        .put('/api/user-Assessmentszes/' + uq_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "mentor",
        email: "mentor@example.com",
        password_digest: "123456",
        admin: true
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      user_Assessments = await UserAssessments.create({
        score: 0.50,
        time: 20.00,
        Assessments_id: Assessments.id,
        user_id: user.id
      });
      other_user_Assessments = await UserAssessments.create({
        score: 1.00,
        time: 19.00,
        Assessments_id: Assessments.id,
        user_id: other_user.id
      });
      user_Assessments_object = {
        score: 1.00,
        time: 35.00,
        Assessments_id: Assessments.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(401);
    });

     it('should return 403 if user is not current user', async () => {
      const res = await response(user_Assessments_object, other_user_Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID', async () => {
      user_Assessments_object.Assessments_id = 'id';
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      user_Assessments_object.Assessments_id = '10000';
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid user_Assessments ID', async () => {
      const user_Assessments_id = 'id';
      const res = await response(user_Assessments_object, user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_Assessments ID valid but user_Assessments ID not in DB', async () => {
      const user_Assessments_id = '10000';
      const res = await response(user_Assessments_object, user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 400 if user_Assessments is invalid', async () => {
      user_Assessments_object = { Assessments_id: Assessments.id };
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(400);
    });

    it('should update user_Assessments if input is valid', async () => {
      const res = await response(user_Assessments_object, user_Assessments.id, token);
      const result = await UserAssessments.findOne({ where: user_Assessments_object });

      expect(result).toHaveProperty('id', user_Assessments.id);
      expect(result).toHaveProperty('score', 1.00);
      expect(result).toHaveProperty('time', 35.00);
      expect(result).toHaveProperty('Assessments_id', Assessments.id);
      expect(result).toHaveProperty('user_id', user.id);
    });

    it('should return updated user_Assessments if it is valid', async () => {
      const res = await response(user_Assessments_object, user_Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_Assessments.id);
      expect(res.body).toHaveProperty('score', 1.00);
      expect(res.body).toHaveProperty('time', 35.00);
      expect(res.body).toHaveProperty('Assessments_id', Assessments.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, other_user, token, category, Assessments,
    user_Assessments, other_user_Assessments, user_answers,
    question_1, question_2;

    const response = async (uq_id, jwt) => {
      return await request
        .delete('/api/user-Assessmentszes/' + uq_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "mentor",
        email: "mentor@example.com",
        password_digest: "123456",
        admin: true
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!'
      });
      user_Assessments = await UserAssessments.create({
        score: 0.50,
        time: 20.00,
        Assessments_id: Assessments.id,
        user_id: user.id
      });
      other_user_Assessments = await UserAssessments.create({
        score: 1.00,
        time: 19.00,
        Assessments_id: Assessments.id,
        user_id: other_user.id
      });
      user_answers = [
        {
          user_Assessments_id: user_Assessments.id,
          answer: "Moo!",
          correct: true,
          question_id: question_1.id
        },
        { user_Assessments_id: user_Assessments.id,
          answer: "Meow!",
          correct: false,
          question_id: question_2.id
        },
        {
          user_Assessments_id: other_user_Assessments.id,
          answer: "Oink!",
          correct: true,
          question_id: question_2.id
        }
      ];
      await UserAnswer.bulkCreate(user_answers);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_Assessments.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(user_Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid user_Assessments ID', async () => {
      const user_Assessments_id = 'id';
      const res = await response(user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_Assessments ID valid but user_Assessments ID not in DB', async () => {
      const user_Assessments_id = '10000';
      const res = await response(user_Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user_Assessments and associated user_answers if input is valid', async () => {
      const res = await response(user_Assessments.id, token);
      const returned_user_Assessments = await UserAssessments.findById(user_Assessments.id);
      const returned_user_answers = await UserAnswer.findAll({
        where: { user_Assessments_id: user_Assessments.id }
      });

      expect(returned_user_Assessments).toBeNull();
      expect(returned_user_answers).toEqual([]);
    });

    it('should return deleted user_Assessments', async () => {
      const res = await response(user_Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_Assessments.id);
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 20.00);
      expect(res.body).toHaveProperty('Assessments_id', Assessments.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });
});
