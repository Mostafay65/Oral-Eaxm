const express = require("express");
const answerController = require("../controllers/answer.controller");
const router = express.Router();
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles.js");
const multer = require("multer");
const path = require("path");
const { randomBytes } = require("crypto");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../Uploads/answers");
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

router.post(
    "/",
    Authorize(roles.Student),
    Upload.single("answerFile"),
    answerController.createAnswer
);

router.get("/student", answerController.getStudentAnswer);

module.exports = router;
