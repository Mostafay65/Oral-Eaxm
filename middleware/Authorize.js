const appError = require("../Utilities/appError");
const httpStatusText = require("../Utilities/httpStatusText");
const jwt = require("jsonwebtoken");

Authorize = (...allowedRolles) => {
    return (req, res, next) => {
        if (!req.headers.authorization) {
            return next(
                new appError(
                    "Json Web Token is required",
                    401,
                    httpStatusText.FAIL
                )
            );
        }
        const token = req.headers.authorization.split(" ")[1];
        try {
            const User = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.User = User;
            if (
                allowedRolles.length == 0 ||
                allowedRolles.includes(User.role) ||
                User.role == "Admin"
            )
                next();
            else throw new Error("");
        } catch (error) {
            return next(
                new appError(
                    "You are not authorized to access this resources",
                    401,
                    httpStatusText.FAIL
                )
            );
        }
    };
};
module.exports = Authorize;
