const User = require("../Models/user");
const userController = {};

userController.saveUser = async (username, sid) => {
    let user = await User.findOne({ name: username });
    if (!user) {
        user = new User({
            name: username,
            token: sid,
            online: true,
        });
    }
    user.token = sid;
    user.online = true;

    await user.save();
    return user;
};

module.exports = userController;
