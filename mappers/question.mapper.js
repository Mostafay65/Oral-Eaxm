const questionMapper = (question) => {
    let result = {
        _id: question._id,
        questionFile:
            process.env.HOST +
            "/uploads/Exams/questions/" +
            question.questionFile,

        questionText: question.questionText,
    };
    
    if (question.answerFile) {
        result.answerFile =
            process.env.HOST + "/uploads/Exams/answers/" + question.answerFile;
        result.answerText = question.answerText;
    }

    return result;
};

module.exports = questionMapper;
