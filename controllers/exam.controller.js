const Exam = require("../models/exam.model.js");
const axyncWrapper = require("../middleware/asyncWrapper.js");
const appError = require("../Utilities/appError.js");
const httpStatusText = require("../Utilities/httpStatusText.js");
const Question = require("../models/question.model.js");
const User = require("../models/user.model.js");
const Instructor = require("../models/role-specific.model.js").Instructor;
const questionMapper = require("../mappers/question.mapper");
const questionModel = require("../models/question.model.js");
const fs = require("fs");
const path = require("path");
const { roles } = require("../Utilities/roles.js");

const getAllExams = axyncWrapper(async (req, res, next) => {
    const exams = await Exam.find(
        { instructor: req.User.id },
        { __v: 0 }
    ).populate({
        path: "instructor",
        select: "-password -__v -exams -role",
    });

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { exams } });
});

const getExamById = axyncWrapper(async (req, res, next) => {
    const examId = req.params.examId;
    const exam = await Exam.findById(examId, { __v: 0 })
        .populate({
            path: "questions",
            select: `-__v ${
                req.User.role === roles.Student ? "-answerFile -answerText" : ""
            }`,
        })
        .populate({
            path: "instructor",
            select: "-password -__v -exams -role",
        })
        .populate({
            path: "students",
            select: "-password -__v -examsAnswer -role",
        })
        .lean();

    if (!exam) {
        return next(
            new appError(
                `Exam with id ${examId} not found`,
                404,
                httpStatusText.FAIL
            )
        );
    }
    exam.questions = exam.questions.map(questionMapper);
    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { exam } });
});

const createExam = axyncWrapper(async (req, res, next) => {
    const { questions } = req.body;

    // rememer that some questions may be still processing so they are not yet saved in the database
    for (let questionId of questions) {
        const question = await Question.findById(questionId);
        if (!question) {
            return next(
                new appError(
                    `Question with id ${questionId} not found`,
                    404,
                    httpStatusText.FAIL
                )
            );
        }
    }

    const exam = new Exam({ ...req.body, instructor: req.User.id });
    await exam.save();

    const instructor = await Instructor.findById(req.User.id);
    instructor.exams.push(exam._id);
    await instructor.save();

    return res.status(201).json({ status: "success", data: { exam } });
});

const deleteExam = axyncWrapper(async (req, res, next) => {
    const examId = req.params.examId;
    const exam = await Exam.findById(examId).populate("questions");

    if (!exam) {
        return next(
            new appError(
                `Exam with id ${examId} not found`,
                404,
                httpStatusText.FAIL
            )
        );
    }
    if (exam.instructor != req.User.id) {
        return next(
            new appError(
                `You are not allowed to delete this exam`,
                401,
                httpStatusText.FAIL
            )
        );
    }

    // Delete all questions and their files

    for (let question of exam.questions) {
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

        if (fs.existsSync(questionFilePath))
            await fs.promises.unlink(questionFilePath);
        if (fs.existsSync(answerFilePath))
            await fs.promises.unlink(answerFilePath);
    }
    await questionModel.deleteMany({ _id: { $in: exam.questions } });
    await exam.deleteOne({ _id: examId });

    return res.status(200).json({ status: "success", data: null });
});

module.exports = { getAllExams, getExamById, createExam, deleteExam };
