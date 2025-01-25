const { default: mongoose } = require("mongoose");

const examschema = new mongoose.Schema({
    title: { type: String, required: true },
    instructor: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
    students: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    duration: { type: Number, min: 0, default: 15, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    degree: { type: Number, default: 100, required: true },
    allowPublicAccess: { type: Boolean, default: true },
    ready: { type: Boolean, default: false },
});

module.exports = mongoose.model("Exam", examschema);
