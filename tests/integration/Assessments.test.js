const { Assessments, Question, Category, User, sequelize } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/Assessmentszes', () => {
  afterEach(async () => {
    await Assessments.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Question.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let category, Assessmentszes, token, user;

    const response = async (jwt) => {
      return await request
        .get('/api/Assessmentszes')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'School' });
      await Assessments.bulkCreate([
          {
            title: 'Solar System',
            description: 'Test your Solar System Knowledge',
            difficulty: 5,
            category_id: category.id
          },
          {
            title: 'Continents',
            description: 'Test your Geography Knowledge',
            difficulty: 10,
            category_id: category.id
          }
        ]);
      user = User.build({ admin: false });
      token = generateAuthToken(user);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all Assessmentszes (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(e => e.title === 'Solar System')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Test your Solar System Knowledge')).toBeTruthy();
      expect(res.body.some(e => e.difficulty === 5)).toBeTruthy();
      expect(res.body.some(e => e.title === 'Continents')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Test your Geography Knowledge')).toBeTruthy();
      expect(res.body.some(e => e.difficulty === 10)).toBeTruthy();
      expect(res.body.some(e => e.category_id === category.id)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let token, category, Assessments_object, user;

    const response = async (object, jwt) => {
      return await request
        .post('/api/Assessmentszes')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      Assessments_object = {
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if Assessments is invalid', async () => {
      Assessments_object = { category_id: category.id };
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid category ID', async () => {
      Assessments_object.category_id = 'id';
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      Assessments_object.category_id = '10000';
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(400);
    });

    it('should save Assessments if Assessments is valid', async () => {
      const res = await response(Assessments_object, token);
      const Assessments = await Assessments.findOne({ where: { title: 'Solar System' }});

      expect(Assessments).toHaveProperty('id');
      expect(Assessments).toHaveProperty('title', 'Solar System');
      expect(Assessments).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(Assessments).toHaveProperty('difficulty', 5);
      expect(Assessments).toHaveProperty('category_id', category.id);
    });

    it('should return Assessments if Assessments is valid', async () => {
      const res = await response(Assessments_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category.id);
    });
  });

  describe('GET /ID', () => {
    let token, category_1, category_2, Assessments, other_Assessments, user;
    const response = async (id, jwt) => {
      return await request
        .get('/api/Assessmentszes/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category_1 = await Category.create({ name: 'School' });
      category_2 = await Category.create({ name: 'Sports' });
      Assessments = await Assessments.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category_1.id
      });
      other_Assessments = await Assessments.create({
        title: 'Basketball',
        description: 'Test your Basketball Knowledge',
        difficulty: 10,
        category_id: category_2.id
      });
      await Question.bulkCreate([
        { id: 1, Assessments_id: Assessments.id, question: 'What does the cow say?', answer: 'Moo!' },
        { id: 2, Assessments_id: Assessments.id, question: 'What does the cat say?', answer: 'Meow!' },
        { id: 3, Assessments_id: other_Assessments.id, question: "What is Harden's number?", answer: '13' }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(401);
    });

    it('should only return questions if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', Assessments.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);

      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions.some(q => q.id === 1)).toBeTruthy();
      expect(res.body.questions.some(q => q.id === 2)).toBeTruthy();
      expect(res.body.questions.some(q => q.Assessments_id === Assessments.id)).toBeFalsy();
      expect(res.body.questions.some(q => q.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Moo!')).toBeFalsy();
      expect(res.body.questions.some(q => q.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Meow!')).toBeFalsy();
    });

    it('should return 404 if invalid Assessments ID', async () => {
      Assessments_id = 'id';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if Assessments ID valid but Assessments ID not in DB', async () => {
      Assessments_id = '10000';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific Assessments if valid Assessments ID', async () => {
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', Assessments.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);

      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions.some(q => q.Assessments_id === Assessments.id)).toBeTruthy();
      expect(res.body.questions.some(q => q.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Moo!')).toBeTruthy();
      expect(res.body.questions.some(q => q.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Meow!')).toBeTruthy();
    });
  });

  describe('PUT /ID', () => {
    let token, category, new_category, Assessments, updated_Assessments, user;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/Assessmentszes/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      new_category = await Category.create({ name: 'Business' });
      Assessments = await Assessments.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category.id
      });

      updated_Assessments = {
        title: 'Top Companies',
        description: 'Test your Business Knowledge',
        difficulty: 7,
        category_id: new_category.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_Assessments, token, Assessments.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(updated_Assessments, token, Assessments.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid Assessments ID', async () => {
      const Assessments_id = 'id';
      const res = await response(updated_Assessments, token, Assessments_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(updated_Assessments, token, Assessments_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid category ID ', async () => {
      updated_Assessments.category_id = 'id';
      const res = await response(updated_Assessments, token, Assessments.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      updated_Assessments.category_id = '10000';
      const res = await response(updated_Assessments, token, Assessments.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if Assessments is invalid', async () => {
      updated_Assessments = { category_id: new_category.id };
      const res = await response(updated_Assessments, token, Assessments.id);
      expect(res.status).toBe(400);
    });

    it('should update Assessments if input is valid', async () => {
      const res = await response(updated_Assessments, token, Assessments.id);
      const saved_Assessments = await Assessments.findOne({ where: { title: 'Top Companies' } });

      expect(saved_Assessments).toHaveProperty('id', Assessments.id);
      expect(saved_Assessments).toHaveProperty('title', 'Top Companies');
      expect(saved_Assessments).toHaveProperty('description', 'Test your Business Knowledge');
      expect(saved_Assessments).toHaveProperty('difficulty', 7);
      expect(saved_Assessments).toHaveProperty('category_id', new_category.id);
    });

    it('should return updated Assessments if it is valid', async () => {
      const res = await response(updated_Assessments, token, Assessments.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', Assessments.id);
      expect(res.body).toHaveProperty('title', 'Top Companies');
      expect(res.body).toHaveProperty('description', 'Test your Business Knowledge');
      expect(res.body).toHaveProperty('difficulty', 7);
      expect(res.body).toHaveProperty('category_id', new_category.id);
    });
  });

  describe('DELETE /ID', () => {
    let token, category_1, category_2, Assessments, user;
    const response = async (id, jwt) => {
      return await request
        .delete('/api/Assessmentszes/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category_1 = await Category.create({ name: 'School' });
      category_2 = await Category.create({ name: 'Sports' });
      Assessments = await Assessments.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category_1.id
      });
      other_Assessments = await Assessments.create({
        title: 'Basketball',
        description: 'Test your Basketball Knowledge',
        difficulty: 10,
        category_id: category_2.id
      });
      await Question.bulkCreate([
        { Assessments_id: Assessments.id, question: 'What does the cow say?', answer: 'Moo!' },
        { Assessments_id: Assessments.id, question: 'What does the cat say?', answer: 'Meow!' },
        { Assessments_id: other_Assessments.id, question: "What is Harden's number?", answer: '13' }
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

    it('should return 404 if invalid Assessments ID', async () => {
      const Assessments_id = 'id';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if Assessments ID valid but Assessments ID not in DB', async () => {
      const Assessments_id = '10000';
      const res = await response(Assessments_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete Assessments and associated questions if input is valid', async () => {
      const res = await response(Assessments.id, token);
      const returned_Assessments = await Assessments.findOne({ where: { id: Assessments.id } });
      const returned_questions = await Question.findAll({ where: { Assessments_id: Assessments.id } });

      expect(returned_Assessments).toBeNull();
      expect(returned_questions).toEqual([]);
    });

    it('should return deleted Assessments', async () => {
      const res = await response(Assessments.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', Assessments.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);
    });
  });
});
