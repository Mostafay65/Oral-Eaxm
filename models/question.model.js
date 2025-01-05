const { default: mongoose } = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionFile: { type: String, required: true },
    questionText: { type: String },
    answerFile: { type: String, required: true },
    answerText: { type: String },
});

module.exports = mongoose.model("Question", questionSchema);
