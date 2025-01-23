const express = require("express");
const router = express.Router();
const Authorize = require("../middleware/Authorize");
const { roles } = require("../Utilities/roles");
const grievanceController = require("../controllers/grievance.controller");

// Routes with authorization
router.post("/", Authorize(roles.Student), grievanceController.createGrievance);
router.get("/", Authorize(roles.Student, roles.Instructor), grievanceController.getAllGrievances);
router.get("/:id", Authorize(roles.Student, roles.Instructor), grievanceController.getGrievance);
router.patch("/:id", Authorize(roles.Instructor), grievanceController.updateGrievance);
router.delete("/:id", Authorize(roles.Instructor), grievanceController.deleteGrievance);

module.exports = router;
