const Bull = require("bull");
const Question = require("../models/question.model");
const transcribe = require("./SpeechToText.service");
const questionProcessingQueue = new Bull("question-processing");

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
    const job = jobs.find(
        (job) => job.data.questionId === questionId
    );

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
