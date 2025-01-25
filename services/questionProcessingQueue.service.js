const Bull = require("bull");
const Question = require("../models/question.model");
const transcribe = require("./SpeechToText.service");
const emailService = require("./email.service");
const Student = require("../models/role-specific.model").Student;
const questionProcessingQueue = new Bull("question-processing");
const Exam = require("../models/exam.model");

questionProcessingQueue.process(async (job) => {
    const { questionFile, answerFile, questionId } = job.data;

    try {
        const questionTranscribe = await transcribe(questionFile.path);
        const answerTranscribe = await transcribe(answerFile.path);

        const newQuestion = new Question({
            _id: questionId,
            questionText: questionTranscribe.transcription,
            questionFile: questionFile.filename,
            answerText: answerTranscribe.transcription,
            answerFile: answerFile.filename,
        });

        await newQuestion.save();

        // check if this is the last question in the queue
        const remainingQuestions = await questionProcessingQueue.getJobs([
            "waiting",
            "active",
            "delayed",
            "paused",
        ]);

        if (remainingQuestions.length === 1) {
            // 1 for the current question
            const notReadyExams = await Exam.find({ ready: false }).populate(
                "instructor students"
            );

            // Update only not ready exams
            await Exam.updateMany({ ready: false }, { $set: { ready: true } });

            for (const exam of notReadyExams) {
                // send email to instructor
                await emailService.sendExamReadyEmail(
                    exam.instructor.email,
                    exam.instructor.name,
                    { title: exam.title }
                );

                const students = await Student.find({});
                // send email only to enrolled students
                for (const student of students) {
                    await emailService.sendExamNotification(
                        student.email,
                        student.name,
                        exam
                    );
                }
            }
        }
    } catch (err) {
        await job.moveToFailed({ message: err.message });
        console.error("Error processing question:", err.message);
    }
});

const add = async (data) => {
    return await questionProcessingQueue.add(data);
};

const getStatus = async (questionId) => {
    const jobs = await questionProcessingQueue.getJobs();
    const job = jobs.find((job) => job.data.questionId === questionId);
    if (!job) return null;

    return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress(),
        data: job.data,
        timestamp: job.timestamp,
    };
};

module.exports = {
    add,
    getStatus,
};
