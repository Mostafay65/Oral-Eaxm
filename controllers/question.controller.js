const Question = require("../models/question.model");
const httpStatusText = require("../Utilities/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../Utilities/appError");

const mapQuestion = (question) => {
    return {
        _id: question._id,
        questionFile:
            process.env.HOST +
            "/uploads/Exams/questions/" +
            question.questionFile,
        answerFile:
            process.env.HOST + "/uploads/Exams/answers/" + question.answerFile,
        questionText: question.questionText,
        answerText: question.answerText,
    };
};

const getAllQuestions = asyncWrapper(async (req, res, next) => {
    const questions = await Question.find({}, { __v: 0 });
    return res.json({
        status: httpStatusText.SUCCESS,
        data: questions.map(mapQuestion),
    });
});

const getQuestionById = asyncWrapper(async (req, res, next) => {
    const question = await Question.findById(req.params.questionId);
    if (!question)
        return next(
            new appError("Question not found", 404, httpStatusText.FAIL)
        );
    return res.json({
        status: httpStatusText.SUCCESS,
        data: mapQuestion(question),
    });
});

const createQuestion = asyncWrapper(async (req, res, next) => {
    const { question, answer } = req.body;
    // console.log("Done ========> ", req.files);

    // call your service here to get the question and answer text
    const newQuestion = new Question({
        questionText: question, //
        questionFile: req.files.questionFile[0].filename,
        answerText: answer, //
        answerFile: req.files.answerFile[0].filename,
    });

    await newQuestion.save();
    return res.json({
        status: httpStatusText.SUCCESS,
        data: mapQuestion(newQuestion),
    });
});

const deleteQuestion = asyncWrapper(async (req, res, next) => {
    const question = await Question.findOneAndDelete({
        _id: req.params.questionId,
    });
    if (!question)
        return next(
            new appError("Question not found", 404, httpStatusText.FAIL)
        );
    return res.json({ status: httpStatusText.SUCCESS, data: question });
});

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    deleteQuestion,
};
