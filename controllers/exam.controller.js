const Exam = require('../models/exam.model.js');

// Create and Save a new Exam
exports.create = (req, res) => {
    // Validate request
    if (!req.body.examName) {
        res.status(400).send({ message: "Exam name can not be empty!" });
        return;
    }

    // Create an Exam
    const exam = new Exam({
        examName: req.body.examName,
        examFile: req.body.examFile,
        examText: req.body.examText,
        examDuration: req.body.examDuration,
        examStartDate: req.body.examStartDate,
        examEndDate: req.body.examEndDate,
    });

    // Save Exam in the database
    exam
        .save(exam)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Exam."
            });
        });
};