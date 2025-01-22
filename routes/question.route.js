const express = require("express");
const questionController = require("../controllers/question.controller");
const multer = require("multer");
const path = require("path");
const appError = require("../Utilities/appError");
const { randomBytes } = require("crypto");
const router = express.Router();
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles.js");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath =
            file.fieldname === "questionFile"
                ? path.join(__dirname, "../Uploads/Exams/questions")
                : path.join(__dirname, "../Uploads/Exams/answers");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const rand = "_" + randomBytes(10).toString("hex") + "_";
        const fileName = Date.now() + rand + file.originalname;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mpeg") cb(null, true);
    else cb(new appError(`File '${file.originalname}' not allowed, Only MP3 files are allowed`), false);
};

const Upload = multer({ storage, fileFilter });

router.get("/", questionController.getAllQuestions);
router.get("/:questionId", questionController.getQuestionById);
router.post(
    "/",
    Authorize(roles.Instructor),
    Upload.fields([
        { name: "questionFile", maxCount: 1 },
        { name: "answerFile", maxCount: 1 },
    ]),
    questionController.createQuestion
);
router.delete("/:questionId", Authorize(roles.Instructor), questionController.deleteQuestion);

module.exports = router;
