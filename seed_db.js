const { User, UserAssessment, UserAnswer,
        Assessment, Category, Question, sequelize } = require('./sequelize');
const bcrypt = require('bcrypt');

(async () => {
  try {
    await sequelize.sync({force: true}); // Reset database

    const salt = await bcrypt.genSalt(10);
    const password_digest = await bcrypt.hash("123456", salt);

    await User.create({
      name: "Mustafizur Rahman",
      email: "mustafizurrah118@example.com",
      password_digest
    });

    const category_1 = await Category.create({ name: "Student"});
    const category_2 = await Category.create({ name: "English"});
    const category_3 = await Category.create({ name: "Math"});

    const Assessment_1 = await Assessment.create({
      title: "Student Assessment",
      description: "Test your ability to read sheet student",
      difficulty: 5,
      category_id: category_1.id
    });
    const Assessment_2 = await Assessment.create({
      title: " English Assessment",
      description: "Test your English knowledge",
      difficulty: 7,
      category_id: category_2.id
    });
    const Assessment_3 = await Assessment.create({
      title: "Math Assessment",
      description: "Test your basic arithmetic knowledge",
      difficulty: 1,
      category_id: category_3.id
    });

    let questions_1 = [];
    const notes = ["C", "D", "E", "F", "G", "A",
                   "B", "Cs", "Ds", "Fs", "Gs", "As"];
    for (note of notes) {
      questions_1.push({ Assessment_id: Assessment_1.id, question: note , answer: note });
    }
    await Question.bulkCreate(questions_1);

    let questions_2 = [];
    const English = ["front-test", "back-test", "basicTest"];
    for (english of english) {
      questions_2.push({ Assessment_id: Assessment_2.id, question: english, answer: english });
    }
    await Question.bulkCreate(questions_2);

    let questions_3 = [
      { Assessment_id: Assessment_3.id, question: "1 + 1 = " , answer: "2" },
      { Assessment_id: Assessment_3.id, question: "2 + 2 = " , answer: "4" },
      { Assessment_id: Assessment_3.id, question: "3 + 3 = " , answer: "6" }
    ];
    await Question.bulkCreate(questions_3);

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
  }

  await sequelize.close();
})();
