const Question = require("../models/question.model");
const httpStatusText = require("../Utilities/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../Utilities/appError");
const questionProcessingQueue = require("../services/questionProcessingQueue.service");
const mongoose = require("mongoose");
const questionMapper = require("../mappers/question.mapper");
const fs = require("fs");
const path = require("path");

const getAllQuestions = asyncWrapper(async (req, res, next) => {
    const questions = await Question.find({}, { __v: 0 });
    return res.json({
        status: httpStatusText.SUCCESS,
        data: questions.map(questionMapper),
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
        data: questionMapper(question),
    });
});

const createQuestion = asyncWrapper(async (req, res, next) => {
    if (!req.files || !req.files.questionFile || !req.files.answerFile) {
        return next(
            new appError("Missing required files ", 400, httpStatusText.ERROR)
        );
    }

    const questionId = new mongoose.Types.ObjectId();
    
    await questionProcessingQueue.add({
        questionId: questionId,
        questionFile: req.files.questionFile[0],
        answerFile: req.files.answerFile[0],
    });

    return res.json({
        status: httpStatusText.SUCCESS,
        message:
            "Your Question is put in the queue and is being processed........",
        data: { questionId },
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
    const questionFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "Exams",
        "questions",
        question.questionFile
    );
    const answerFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "Exams",
        "answers",
        question.answerFile
    );
    if (fs.existsSync(questionFilePath)) await fs.promises.unlink(questionFilePath);
    if (fs.existsSync(answerFilePath)) await fs.promises.unlink(answerFilePath);

    return res.json({ status: httpStatusText.SUCCESS, data: question });
});

const getQuestionProcessingStatus = asyncWrapper(async (req, res, next) => {
    const { questionId } = req.params;
    
    const status = await questionProcessingQueue.getStatus(questionId);
    
    if (!status) {
        return next(
            new appError("Question processing job not found", 404, httpStatusText.FAIL)
        );
    }

    return res.json({
        status: httpStatusText.SUCCESS,
        data: status
    });
});

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    deleteQuestion,
    getQuestionProcessingStatus  // Add this new export
};
