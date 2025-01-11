const examController = require("../controllers/exam.controller.js");
const express = require("express");
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles.js");

const router = express.Router();

router.get("/", Authorize(roles.Instructor), examController.getAllExams);
router.get("/:examId", Authorize(roles.Instructor), examController.getExamById);
router.post("/", Authorize(roles.Instructor), examController.createExam);
router.delete("/:examId", Authorize(roles.Instructor), examController.deleteExam);

module.exports = router;
