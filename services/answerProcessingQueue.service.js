const Bull = require("bull");
const Student = require("../models/role-specific.model").Student;
const transcribe = require("./SpeechToText.service");
const GeminiAPI = require("./geminiAPI.service");
const Question = require("../models/question.model");
const Exam = require("../models/exam.model");
const emailService = require("./email.service");

const answerProcessingQueue = new Bull("answer-processing");

answerProcessingQueue.process(async (job) => {
    const { answerFile, examId, studentId, questionId } = job.data;

    try {
        const answerTranscribe = await transcribe(answerFile.path);
        const question = await Question.findById(questionId);
        const mark = await GeminiAPI.gradeQuestion(
            question.questionText,
            question.answerText,
            answerTranscribe.transcription
        );

        const student = await Student.findById(studentId).populate("examsAnswer");
        const exam = await Exam.findById(examId);

        // Add the answer
        await Student.findByIdAndUpdate(studentId, {
            $push: {
                examsAnswer: {
                    exam: examId,
                    question: questionId,
                    answerFile: answerFile.filename,
                    answerText: answerTranscribe.transcription,
                    mark,
                },
            },
        });

        // Check if this was the last question
        const studentAnswers = student.examsAnswer.filter(
            (answer) => answer.exam.toString() === examId
        );

        if (studentAnswers.length + 1 === exam.questions.length) {
            let totalMark = Number(mark);
            for (let i = 0; i < studentAnswers.length; i++) {
                totalMark += Number(studentAnswers[i].mark);
            }

            const finalGrade = (exam.degree * totalMark) / (exam.questions.length * 10);
            
            // Ensure finalGrade is a valid number
            if (isNaN(finalGrade)) {
                throw new Error("Invalid grade calculation");
            }

            // Update completed exam status
            await Student.findByIdAndUpdate(studentId, {
                $push: {
                    completedExams: {
                        exam: examId,
                        totalMark: finalGrade,
                        isCompleted: true,
                    },
                },
            });

            // Send email notification
            await emailService.sendGradeEmail(
                student.email,
                student.name,
                {
                    title: exam.title,
                    degree: exam.degree,
                },
                finalGrade
            );
        }
    } catch (err) {
        console.error("Error processing answer:", err.message, err.stack);
    }
});

module.exports = answerProcessingQueue;
