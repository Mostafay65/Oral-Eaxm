const mongoose = require("mongoose");
const User = require("./user.model");

const Student = User.discriminator(
    "STUDENT",
    new mongoose.Schema({
        examsAnswer: [
            {
                exam: { type: mongoose.Schema.Types.ObjectId, ref: "" },
                questionsAnswer: {
                    question:{ type: mongoose.Schema.Types.ObjectId, ref: "Question" },
                    studentAnswerFile: { type: string, required: true },
                    studentAnswerText: { type: string, required: true },
                },
            },
        ],
    })
);

const Instructor = User.discriminator(
    "INSTRUCTOR",
    new mongoose.Schema({
        exams: [{ type: mongoose.Types.ObjectId, ref: "exams" }],
    })
);

module.exports = {
    Student,
    Instructor,
};
