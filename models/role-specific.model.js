const mongoose = require("mongoose");
const User = require("./user.model");
const { roles } = require("../Utilities/roles");

const Student = User.discriminator(
    roles.Student,
    new mongoose.Schema({
        examsAnswer: [
            {
                exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                },
                answerFile: { type: String, required: true },
                answerText: { type: String, required: true },
                mark: { type: Number, required: true },
            },
        ],
        completedExams: [
            {
                exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
                totalMark: { type: Number },
                isCompleted: { type: Boolean, default: false }
            }
        ]
    })
);

const Instructor = User.discriminator(
    roles.Instructor,
    new mongoose.Schema({
        exams: [{ type: mongoose.Types.ObjectId, ref: "Exam" }],
    })
);

module.exports = {
    Student,
    Instructor,
};
