const express = require("express");
const userController = require("../controllers/Users.controller");
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles");


const router = express.Router();
router.get("/", Authorize(roles.Student), userController.getAllUsers);

module.exports = router;
