const express = require("express");
const authcontroller = require("../controllers/Auth.controller");

const router = express.Router();

router.post("/login", authcontroller.Login);
router.post("/Register", authcontroller.Register);

module.exports = router;
