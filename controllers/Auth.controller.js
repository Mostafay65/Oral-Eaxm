const httpStatusText = require("../Utilities/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const generateJWT = require("../Utilities/generateJWT");
const appError = require("../Utilities/appError");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

const Register = asyncWrapper(async (req, res, next) => {
    if ((await User.findOne({ email: req.body.email })) != null) {
        return next(
            new appError("Email already exists", 400, httpStatusText.FAIL)
        );
    }
    const newUser = new User({
        ...req.body,
        password: await bcrypt.hash(req.body.password, 10),
    });

    // generate jwt token
    const token = generateJWT({
        email: newUser.email,
        id: newUser._id,
        role: newUser.role,
    });

    await newUser.save();

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { newUser, token },
    });
});

const Login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(
            new appError(
                "Email and Password are required",
                400,
                httpStatusText.FAIL
            )
        );

    const user = await User.findOne({ email });
    if (user == null)
        return next(new appError("User not found", 404, httpStatusText.FAIL));

    if (!(await bcrypt.compare(password, user.password)))
        return next(
            new appError(
                "Email or password are incorrect",
                400,
                httpStatusText.FAIL
            )
        );

    // generate JWT token
    const token = generateJWT({ email, id: user._id, role: user.role });
    return res.json({
        status: httpStatusText.SUCCESS,
        data: { token },
    });
});

module.exports = {
    Login,
    Register,
};
