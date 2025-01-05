const { default: mongoose } = require("mongoose");

const examschema = new mongoose.Schema({
    name: { type: String, required: true },
    Instructor: { type: mongoose.Schema.ObjectId, ref: "Instructor" },
    questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
    minutesAllowed: { type: Number, min: 0, default: 15 },
    degree: { type: Number, default: 100 },
    allowPublicAccess: { type: Boolean, default: true },
});

module.exports = mongoose.model("Exam", examschema);
