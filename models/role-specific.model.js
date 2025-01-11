const mongoose = require("mongoose");
const User = require("./user.model");
const { roles } = require("../Utilities/roles");

const Student = User.discriminator(
    roles.Student,
    new mongoose.Schema({
        examsAnswer: [
            {
                exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
                questionsAnswer: [
                    {
                        question: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Question",
                        },
                        studentAnswerFile: { type: String, required: true },
                        studentAnswerText: { type: String, required: true },
                    },
                ],
            },
        ],
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
