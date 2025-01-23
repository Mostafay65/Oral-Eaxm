const mongoose = require("mongoose");
const asyncWrapper = require("../middleware/asyncWrapper");
const Grievance = require("../models/grievance.model");
const Student = require("../models/role-specific.model").Student;
const Exam = require("../models/exam.model");
const appError = require("../Utilities/appError");
const httpStatusText = require("../Utilities/httpStatusText");
const {roles} = require("../Utilities/roles");

// Create new grievance
const createGrievance = asyncWrapper(async (req, res, next) => {
    const { studentId, examId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        return next(new appError("Student not found", 400, httpStatusText.FAIL));
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
        return next(new appError("Exam not found", 400, httpStatusText.FAIL)); 
    }

    const studentExam = await Exam.findOne({ _id: examId, students: { $in: [studentId] }});
    if (!studentExam) {
        return next(new appError("Student did not take this exam", 400, httpStatusText.FAIL));
    }

    const existingGrievance = await Grievance.findOne({ studentId, examId });
    if (existingGrievance) {
        return next(new appError("Student has already submitted a grievance for this exam", 400, httpStatusText.FAIL));
    }

    const grievance = await Grievance.create({
        studentId,
        examId
    });

    return res.status(201).json({
        status: httpStatusText.SUCCESS,
        message: "Grievance created successfully",
        data: grievance
    });
});

// Get all grievances
const getAllGrievances = asyncWrapper(async (req, res, next) => {
    const { examId } = req.body;
    const { role, id } = req.User;

    if (role === roles.Student) {
        const grievances = await Grievance.find({ studentId: id, examId });
        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: grievances
        });
    }

    if (role === roles.Instructor) {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return next(new appError("Exam not found", 404, httpStatusText.FAIL));
        }

        if (exam.instructor.toString() !== id) {
            return next(new appError("You are not authorized to view these grievances", 403, httpStatusText.FAIL));
        }

        const grievances = await Grievance.find({ examId });
        return res.status(200).json({
            status: httpStatusText.SUCCESS, 
            data: grievances
        });
    }

    return next(new appError("Unauthorized role", 403, httpStatusText.FAIL));
});

// Get single grievance
const getGrievance = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        return next(new appError("Grievance not found", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: grievance
    });
});

// Update grievance
const updateGrievance = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    // check is the user that updates is the instructer of the grievance exam
    

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        return next(new appError("Grievance not found", 404, httpStatusText.FAIL));
    }

    // Update grievance
    const updatedGrievance = await Grievance.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!grievance) {
        return next(new appError("Grievance not found", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: grievance
    });
});

// Delete grievance
const deleteGrievance = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const grievance = await Grievance.findByIdAndDelete(id);
    if (!grievance) {
        return next(new appError("Grievance not found", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Grievance deleted successfully"
    });
});

module.exports = {
    createGrievance,
    getAllGrievances,
    getGrievance,
    updateGrievance,
    deleteGrievance
};
