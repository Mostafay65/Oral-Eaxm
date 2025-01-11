const questionMapper = (question) => {
    return {
        _id: question._id,
        questionFile:
            process.env.HOST +
            "/uploads/Exams/questions/" +
            question.questionFile,
        answerFile:
            process.env.HOST + "/uploads/Exams/answers/" + question.answerFile,
        questionText: question.questionText,
        answerText: question.answerText,
    };
};

module.exports = questionMapper;
