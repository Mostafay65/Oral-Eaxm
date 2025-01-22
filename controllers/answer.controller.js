const asyncwrapper = require("../middleware/asyncWrapper");
const Exam = require("../models/exam.model");
const Question = require("../models/question.model");
const answerProcessingService = require("../services/answerProcessingQueue.service");
const appError = require("../Utilities/appError");
const httpStatusText = require("../Utilities/httpStatusText");
const Student = require("../models/role-specific.model").Student;

const getStudentAnswer = asyncwrapper(async (req, res, next) => {
    const { studentId, examId } = req.body;
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam)
        return next(new appError("Exam not found", 400, httpStatusText.FAIL));

    const student = await Student.findById(studentId).populate(
        "examsAnswer.question"
    );
    if (!student)
        return next(
            new appError("student not found", 400, httpStatusText.FAIL)
        );

    const studentAnswers = student.examsAnswer.filter(
        (answer) => answer.exam.toString() === examId
    );

    // ?   ====>   exam.degree
    // studentGrade  ====>   cnt * 10

    const studentDegree = studentAnswers.reduce(
        (acc, answer) => acc + answer.mark,
        0
    );

    const result = {
        examId: exam.id,
        studentId: student.id,
        title: exam.name,
        examDegree: exam.degree,
        studentDegree: (exam.degree * studentDegree) / (studentAnswers.length * 10),
        answers: [],
    };
    const questionPath = process.env.HOST + "/uploads/Exams/questions/";
    const answerPath = process.env.HOST + "/uploads/Exams/answers/";
    const studentAnswerPath = process.env.HOST + "/uploads/answers/";

    for (let i = 0; i < studentAnswers.length; i++) {
        const studentAnswer = studentAnswers[i];
        result.answers.push({
            questionId: studentAnswer.question._id,
            questionFile: questionPath + studentAnswer.question.questionFile,
            questionText: studentAnswer.question.questionText,
            correctAnswerFile: answerPath + studentAnswer.question.answerFile,
            correctAnswerText: studentAnswer.question.answerText,
            studentAnswerFile: studentAnswerPath + studentAnswer.answerFile,
            studentAnswerText: studentAnswer.answerText,
            mark: studentAnswer.mark,
        });
    }
    return res.status(200).json({ status: "success", data: result });
});

const createAnswer = asyncwrapper(async (req, res) => {
    const { examId, questionId } = req.body;
    const student = req.User;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const qstion = await Question.findById(questionId);
    if (!qstion) return res.status(404).json({ message: "Question not found" });

    if (!req.file)
        return next(
            new appError(
                "Invalid answer file provided.",
                400,
                httpStatusText.FAIL
            )
        );

    // add the current student to the exam just ones
    if (exam.students.indexOf(student.id) === -1) {
        exam.students.push(student.id);
        exam.save();
    } else {
        return next(
            new appError(
                "You have already answered this question",
                400,
                httpStatusText.FAIL
            )
        );
    }

    await answerProcessingService.add({
        answerFile: req.file,
        examId,
        studentId: student.id,
        questionId,
    });

    return res.status(201).json({
        status: "success",
        message: "Your answer is saved successfully and is being processed... ",
    });
});

module.exports = { createAnswer, getStudentAnswer };
