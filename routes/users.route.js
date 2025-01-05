const express = require("express");
const userController = require("../controllers/Users.controller");
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles");


const router = express.Router();
router.get("/", Authorize(roles.Student, roles.Instructor), userController.getAllUsers);

module.exports = router;
