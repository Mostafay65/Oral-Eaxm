const Bull = require("bull");
const Student = require("../models/role-specific.model").Student;
const transcribe = require("./SpeechToText.service");
const { gradeQuestion } = require("./grading.service");
const Question = require("../models/question.model");

const answerProcessingQueue = new Bull("answer-processing");

answerProcessingQueue.process(async (job) => {
    const { answerFile, examId, studentId, questionId } = job.data;

    try {
        const answerTranscribe = await transcribe(answerFile.path);

        const question = await Question.findById(questionId);

        const mark = await gradeQuestion(
            question.questionText,
            question.answerText,
            answerTranscribe.transcription
        );

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                $push: {
                    examsAnswer: {
                        exam: examId,
                        question: questionId,
                        answerFile: answerFile.filename,
                        answerText: answerTranscribe.transcription,
                        mark,
                    },
                },
            },
            { new: true }
        );

        if (!updatedStudent) {
            throw new Error(
                `Student with ID ${studentId} not found or update failed.`
            );
        }
    } catch (err) {
        console.error("Error processing answer:", err.message, err.stack);
    }
});

module.exports = answerProcessingQueue;
