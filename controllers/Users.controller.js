const httpStatusText = require("../Utilities/httpStatusText");
const user = require("../models/user.model");
const Instructor = require("../models/role-specific.model").Instructor;
const Student = require("../models/role-specific.model").Student;
const asyncWrapper = require("../middleware/asyncWrapper");

const getAllUsers = asyncWrapper(async (req, res, next) => {
    const users = await user.find({}, { __v: 0, password: 0 });
    return res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getAllInstructors = asyncWrapper(async (req, res, next) => {
    const Instructors = await Instructor.find(
        {},
        { __v: 0, password: 0 }
    ).populate("exams");
    return res.json({ status: httpStatusText.SUCCESS, data: { Instructors } });
});

const getAllStudents = asyncWrapper(async (req, res, next) => {
    const Students = await Student.find({}, { __v: 0, password: 0 })
        // .populate({
        //     path: "examsAnswer.exam",
        // })
        // .populate({
        //     path: "examsAnswer.question",
        // });

    return res.json({ status: httpStatusText.SUCCESS, data: { Students } });
});

module.exports = {
    getAllInstructors,
    getAllStudents,
    getAllUsers,
};
