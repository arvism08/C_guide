const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Question = require("../models/Question");

// controller actions

//show all Questions
module.exports.allquestion_get = (req, res) => {
  Question.find({}, (err, allquestions) => {
    if (err) {
      console.log(err);
    } else {
      res.render("smoothies", { question: allquestions });
    }
  });
};

//shows the form to create a new Question
module.exports.newquestion_get = (req, res) => {
  res.render("questions/UpdateQuestionList");
};

//adding a new Question to database.
module.exports.newquestion_post = async (req, res) => {
  const { problem, topic } = req.body;
  //to access the (user - id) while using JWT token , first decode it : spent 2hrs on figuring out this.
  const token = req.cookies.jwt;
  const user = jwt.verify(token, "this is question asking website!!");
  let userData = await User.findById(user.id);
  var author = {
    id: user.id,
  };

  //new question
  const newQuestion = new Question({
    title: topic,
    author: author,
    query: problem,
  });

  Question.create(newQuestion, function (err, question) {
    if (err) {
      res.send(err);
    } else {
      //save question
      question.save();
      userData.questions.push(question);
      userData.save();
      res.status(200).json({ questionID: question._id });
    }
  });
};

//find the question with provided ID and show its detail , with answers related to this question
module.exports.detailQuestion_get = (req, res) => {
  Question.findById(req.params.id)
    .populate("answers")
    .exec((err, foundquestion) => {
      if (err) {
        console.log(err);
      } else {
        res.render("questions/QuestionDisplay", { question: foundquestion });
      }
    });
};

//to delete the question
module.exports.Question_delete = async (req, res) => {
  //now delete that from Answer model
  Question.findByIdAndRemove(req.body.questionID, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({ msg: "success" });
    }
  });
};
