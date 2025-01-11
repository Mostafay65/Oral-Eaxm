const jwt = require("jsonwebtoken");

const generateJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "50m" });
};

module.exports = generateJWT;
