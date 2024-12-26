const httpStatusText = require("../Utilities/httpStatusText");
const user = require("../models/user.model");
const asyncWrapper = require("../middleware/asyncWrapper");


const getAllUsers = asyncWrapper(async (req, res, next) => {
    const users = await user.find({}, { __v: 0 });
    return res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

module.exports = {
    getAllUsers,
};
