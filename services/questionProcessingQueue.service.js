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
        console.error("Error processing question:", err);
    }
});

module.exports = questionProcessingQueue;
