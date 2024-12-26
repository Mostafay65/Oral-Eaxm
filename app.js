require("dotenv").config();
const express = require("express");
const Path = require("path");
const connectDB = require("./config/db");
const userRouter = require("./routes/users.route");
const authRouter = require("./routes/auth.route");
const httpStatusText = require("./Utilities/httpStatusText");
connectDB();

let app = express();
app.use(express.json());

app.use("/Uploads", express.static(Path.join(__dirname, "Uploads")));
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.all("*", async (req, res, next) => {
    res.status(404).json({
        status: httpStatusText.ERROR,
        message: "Routing not found",
    });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: error.statusText || httpStatusText.ERROR,
        message: error.message,
        data: null,
    });
});

app.use(express.json());

app.listen(process.env.PORT, "Localhost", () => {
    console.log("listening on port", process.env.PORT);
});
