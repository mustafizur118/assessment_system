const { Assessments, Question, User, Category, sequelize } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/Assessments/:AssessmentsId/questions', () => {
  afterEach(async () => {
    await Question.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Assessments.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, token, Assessments;

    const response = async (AssessmentsId, jwt) => {
      return await request
        .get(`/api/Assessmentszes/${AssessmentsId}/questions`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      await Question.bulkCreate([
        { Assessments_id: Assessments.id, question: 'What does the cow say?', answer: 'Moo!' },
        { Assessments_id: Assessments.id, question: 'What does the cat say?', answer: 'Meow!' }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID ', async () => {
      const Assessments_id = 'id';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(400);
    });

    it('should return all questions (stat code 200)', async () => {

      const res = await response(Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.some(m => m.answer === 'Moo!')).toBeTruthy();
      expect(res.body.some(m => m.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.some(m => m.answer === 'Meow!')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let user, token, Assessments, question_object;

    const response = async (object, AssessmentsId, jwt) => {
      return await request
        .post(`/api/Assessmentszes/${AssessmentsId}/questions`)
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_object = { question: 'What does the cow say?', answer: 'Moo!' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(question_object, Assessments.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(question_object, Assessments.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID ', async () => {
      const Assessments_id = 'id';
      const res = await response(question_object, Assessments_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(question_object, Assessments_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if question is invalid', async () => {
      question_object = {};
      const res = await response(question_object, Assessments.id, token);

      expect(res.status).toBe(400);
    });

    it('should save question if question is valid', async () => {
      const res = await response(question_object, Assessments.id, token);
      const question = await Question.findOne({
        where: { question: 'What does the cow say?', answer: 'Moo!' }
      });

      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question', 'What does the cow say?');
      expect(question).toHaveProperty('answer', 'Moo!');
    });

    it('should return question if question is valid', async () => {
      const res = await response(question_object, Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('question', 'What does the cow say?');
      expect(res.body).toHaveProperty('answer', 'Moo!');
    });
  });

  describe('GET /ID', () => {
    let user, token, Assessments, question;

    const response = async (AssessmentsId, id, jwt) => {
      return await request
        .get(`/api/Assessmentszes/${AssessmentsId}/questions/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question = await Question.create({
        Assessments_id: Assessments.id,
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID ', async () => {
      const Assessments_id = 'id';
      const res = await response(Assessments_id, question.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(Assessments_id, question.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid question ID', async () => {
      const question_id = 'id';
      const res = await response(Assessments.id, question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const question_id = '10000';
      const res = await response(Assessments.id, question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific question if valid Assessments and question ID', async () => {
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', question.question);
      expect(res.body).toHaveProperty('answer', question.answer);
    });
  });

  describe('PUT /ID', () => {
    let user, token, Assessments, question_object, question;

    const response = async (object, jwt, AssessmentsId, id) => {
      return await request
        .put(`/api/Assessmentszes/${AssessmentsId}/questions/${id}`)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question = await Question.create({
        Assessments_id: Assessments.id,
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      question_object = { question: 'What does the pig say?', answer: 'Oink!' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(question_object, token, Assessments.id, question.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(question_object, token, Assessments.id, question.id);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID ', async () => {
      const Assessments_id = 'id';
      const res = await response(question_object, token, Assessments_id, question.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(question_object, token, Assessments_id, question.id);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid question ID ', async () => {
      const question_id = 'id';
      const res = await response(question_object, token, Assessments.id, question_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const question_id = '10000';
      const res = await response(question_object, token, Assessments.id, question_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if question is invalid', async () => {
      question_object = {};
      const res = await response(question_object, token, Assessments.id, question.id);

      expect(res.status).toBe(400);
    });

    it('should update question if input is valid', async () => {
      const res = await response(question_object, token, Assessments.id, question.id);
      const result = await Question.findOne({ where: { id: question.id } });

      expect(result).toHaveProperty('question', 'What does the pig say?');
      expect(result).toHaveProperty('answer', 'Oink!');
    });

    it('should return updated question if it is valid', async () => {
      const res = await response(question_object, token, Assessments.id, question.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', 'What does the pig say?');
      expect(res.body).toHaveProperty('answer', 'Oink!');
    });
  });

  describe('DELETE /ID', () => {
    let user, token, Assessments, question;

    const response = async (AssessmentsId, id, jwt) => {
      return await request
        .delete(`/api/Assessmentszes/${AssessmentsId}/questions/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach( async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      Assessments = await Assessments.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question = await Question.create({
        Assessments_id: Assessments.id,
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid Assessments ID ', async () => {
      const Assessments_id = 'id';
      const res = await response(Assessments_id, question.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(Assessments_id, question.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid question ID', async () => {
      const question_id = 'id';
      const res = await response(Assessments.id, question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const question_id = '100000';
      const res = await response(Assessments.id, question_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete question if input is valid', async () => {
      const res = await response(Assessments.id, question.id, token);
      const result = await Question.findOne({ where: { id: question.id } });

      expect(result).toBeNull();
    });

    it('should return deleted question', async () => {
      const res = await response(Assessments.id, question.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', question.question);
      expect(res.body).toHaveProperty('answer', question.answer);
    });
  });
});
