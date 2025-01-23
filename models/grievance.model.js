const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
        },
        examId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Grievance", grievanceSchema);
