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
    if (!exam) return next(new appError("Exam not found", 400, httpStatusText.FAIL));

    const student = await Student.findById(studentId)
        .populate("examsAnswer.question")
        .populate("completedExams");
    if (!student)
        return next(new appError("student not found", 400, httpStatusText.FAIL));

    const studentAnswers = student.examsAnswer.filter(
        (answer) => answer.exam.toString() === examId
    );

    const result = {
        examId: exam.id,
        studentId: student.id,
        title: exam.title,
        examDegree: exam.degree,
        totalMark:
            student.completedExams?.find((exam) => exam.exam.toString() === examId)
                ?.totalMark || 0,
        answers: [],
    };
    const questionPath = process.env.HOST + "/uploads/Exams/questions/";
    const answerPath = process.env.HOST + "/uploads/Exams/answers/";
    const studentAnswerPath = process.env.HOST + "/uploads/answers/";

    for (let i = 0; i < studentAnswers.length; i++) {
        const studentAnswer = studentAnswers[i];
        result.answers.push({
            id: studentAnswer._id,
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

const createAnswer = asyncwrapper(async (req, res, next) => {
    const { examId, questionId } = req.body;
    // Get the populated student data
    const student = await Student.findById(req.User.id);
    if (!student) {
        return next(new appError("Student not found", 404, httpStatusText.FAIL));
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (!req.file)
        return next(
            new appError("Invalid answer file provided.", 400, httpStatusText.FAIL)
        );

    if (Date.now() < new Date(exam.startDate)) {
        return next(
            new appError("this exam hasn't started yet", 400, httpStatusText.FAIL)
        );
    }
    if (Date.now() > new Date(exam.endDate).getTime() + 60000) {
        // allowing one minute after exam end time
        return next(new appError("Sorry this exam has ended", 400, httpStatusText.FAIL));
    }

    // add the current student to the exam just ones
    if (exam.students.indexOf(student.id) === -1) {
        exam.students.push(student.id);
        exam.save();
    }

    const answer = student.examsAnswer.find(
        (answer) => answer.question.toString() === questionId
    );
    if (answer) {
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

const updateAnswerMark = asyncwrapper(async (req, res, next) => {
    const { answerId, studentId } = req.params;
    const { mark } = req.body;

    // Find the student and populate their exam answers
    const studentDoc = await Student.findById(studentId).populate("completedExams.exam");
    if (!studentDoc) {
        return next(new appError("Student not found", 404, httpStatusText.FAIL));
    }

    // Find the specific answer in student's examsAnswer array
    const answer = studentDoc.examsAnswer.find(
        (answer) => answer._id.toString() === answerId
    );

    if (!answer) {
        return next(new appError("Answer not found", 404, httpStatusText.FAIL));
    }

    // Validate mark value
    if (mark < 0 || mark > 10) {
        return next(
            new appError("Mark must be between 0 and 10", 400, httpStatusText.FAIL)
        );
    }

    // Update the mark
    answer.mark = mark;

    const exam = await Exam.findById(answer.exam);
    // update the total mark of the student
    const examAnswers = studentDoc.examsAnswer.filter(
        (ans) => ans.exam.toString() === answer.exam.toString()
    );
    const totalMark = examAnswers.reduce((sum, ans) => sum + (Number(ans.mark) || 0), 0);

    // Find or create completedExam entry
    const completedExamIndex = studentDoc.completedExams.findIndex(
        (exam) => exam.exam._id.toString() === answer.exam.toString()
    );

    const finalGrade = (exam.degree * totalMark) / (exam.questions.length * 10);

    if (completedExamIndex !== -1) {
        studentDoc.completedExams[completedExamIndex].totalMark = finalGrade;
    } else {
        studentDoc.completedExams.push({
            exam: answer.exam,
            totalMark: finalGrade,
        });
    }
    await studentDoc.save();

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Answer mark updated successfully",
        data: {
            answerId,
            mark,
        },
    });
});

module.exports = { createAnswer, getStudentAnswer, updateAnswerMark };
