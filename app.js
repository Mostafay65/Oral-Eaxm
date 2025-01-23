require("dotenv").config();
const express = require("express");
const Path = require("path");
const connectDB = require("./config/db");
const userRouter = require("./routes/users.route");
const authRouter = require("./routes/auth.route");
const questionRouter = require("./routes/question.route");
const answerRouter = require("./routes/answer.route");
const examRouter = require("./routes/exam.route");
const grievanceRouter = require("./routes/grievance.route");
const httpStatusText = require("./Utilities/httpStatusText");

connectDB();

let app = express();
app.use(express.json());

app.use("/uploads", express.static(Path.join(__dirname, "Uploads")));

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/question", questionRouter);
app.use("/api/exam", examRouter);
app.use("/api/answer", answerRouter);
app.use("/api/grievance", grievanceRouter);

app.all("*", async (req, res, next) => {
    res.status(404).json({
        status: httpStatusText.ERROR,
        message: "Routing not found",
    });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: error.statusCodeText || httpStatusText.ERROR,
        message: error.message,
        data: null,
    });
});

app.use(express.json());

app.listen(process.env.PORT, "Localhost", () => {
    console.log("listening on port", process.env.PORT);
});
