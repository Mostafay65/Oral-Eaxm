const express = require("express");
const userController = require("../controllers/Users.controller");
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles");


const router = express.Router();

router.get("/", Authorize(roles.Instructor), userController.getAllUsers);
router.get("/instructors", Authorize(roles.Instructor), userController.getAllInstructors);
router.get("/students", Authorize(roles.Student, roles.Instructor), userController.getAllStudents);

module.exports = router;
