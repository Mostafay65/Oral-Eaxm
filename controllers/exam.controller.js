const Exam = require("../models/exam.model.js");
const axyncWrapper = require("../middleware/asyncWrapper.js");
const appError = require("../Utilities/appError.js");
const httpStatusText = require("../Utilities/httpStatusText.js");
const Question = require("../models/question.model.js");
const Student = require("../models/role-specific.model.js").Student;
const Instructor = require("../models/role-specific.model.js").Instructor;
const questionMapper = require("../mappers/question.mapper");
const questionProcessingQueue = require("../services/questionProcessingQueue.service");
const questionModel = require("../models/question.model.js");
const fs = require("fs");
const path = require("path");
const { roles } = require("../Utilities/roles.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const GeminiAPI = require("../services/geminiAPI.service.js");
const emailService = require("../services/email.service.js");

const getAllExams = axyncWrapper(async (req, res, next) => {
    const exams = await Exam.find({ instructor: req.User.id }, { __v: 0 }).populate({
        path: "instructor",
        select: "-password -__v -exams -role",
    });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { exams } });
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
            new appError(`Exam with id ${examId} not found`, 404, httpStatusText.FAIL)
        );
    }

    if (exam.ready === false)
        return next(
            new appError("this exam is still being processed just wait a few minutes.")
        );

    exam.questions = exam.questions.map(questionMapper);
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { exam } });
});

const getExamFeedback = asyncWrapper(async (req, res, next) => {
    const examId = req.params.examId;
    const studentId = req.User.id;

    const exam = await Exam.findById(examId);
    if (!exam) {
        return next(
            new appError(`Exam with id ${examId} not found`, 404, httpStatusText.FAIL)
        );
    }

    const student = await Student.findById(studentId)
        .populate({
            path: "completedExams",
            match: { exam: examId },
        })
        .populate({
            path: "examsAnswer.question",
        });

    if (student.completedExams.length === 0) {
        return next(
            new appError(
                `You have not participated in this exam`,
                404,
                httpStatusText.FAIL
            )
        );
    }
    // console.log(student);
    if (student.completedExams[0].feedback === "N/A") {
        // call the feedback api
        const answers = [];
        for (const answer of student.examsAnswer) {
            answers.push({
                question: answer.question.questionText,
                correctAnswer: answer.question.answerText,
                studentAnswer: answer.answerText,
            });
        }
        //pass answers to the api
        const feedback = await GeminiAPI.feedback(answers, exam);
        student.completedExams[0].feedback = feedback;
        await student.save();
        // send email to the user with the feedback
        await emailService.sendFeedbackEmail(student.email, student.name, exam, feedback);
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { feedback: student.completedExams[0].feedback },
    });
});
const createExam = axyncWrapper(async (req, res, next) => {
    const { questions } = req.body;

    let ready = true;
    for (let questionId of questions) {
        const question = await Question.findById(questionId);

        if (!question) {
            // Check question processing queue
            const processingStatus = await questionProcessingQueue.getStatus(questionId);

            if (!processingStatus || processingStatus.status === "failed") {
                return next(
                    new appError(
                        `Question with id ${questionId} processing failed. Please create the question again.`,
                        400,
                        httpStatusText.FAIL
                    )
                );
            } else if (
                ["waiting", "completed", "active", "delayed", "paused"].includes(
                    processingStatus.status
                )
            ) {
                if (processingStatus.status !== "completed") ready = false;
                continue;
            }

            return next(
                new appError(
                    `Question with id ${questionId} not found`,
                    404,
                    httpStatusText.FAIL
                )
            );
        }
    }

    const exam = new Exam({ ...req.body, instructor: req.User.id, ready });
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
            new appError(`Exam with id ${examId} not found`, 404, httpStatusText.FAIL)
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

        if (fs.existsSync(questionFilePath)) await fs.promises.unlink(questionFilePath);
        if (fs.existsSync(answerFilePath)) await fs.promises.unlink(answerFilePath);
    }
    await questionModel.deleteMany({ _id: { $in: exam.questions } });

    const instructor = await Instructor.findById(exam.instructor);
    instructor.exams = instructor.exams.filter((id) => id.toString() !== examId);
    await instructor.save();

    await exam.deleteOne({ _id: examId });

    return res.status(200).json({ status: "success", data: null });
});

module.exports = { getAllExams, getExamById, getExamFeedback, createExam, deleteExam };
