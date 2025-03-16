const userController = require("../Controllers/user.controllers");
const User = require("../Models/user");

module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log("connected", socket.id);

        socket.on("login", async (user, partner, cb) => {
            console.log("user", user);
            try {
                const userdata = await userController.saveUser(user, socket.id);
                socket.join(user); // ✅ 자기 이름으로 방 참여
                cb({ ok: true, data: userdata });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });
        

        socket.on("chat_message", (data) => {
            const { sender, receiver, message } = data;
            console.log(`From ${sender} to ${receiver}: ${message}`);
        
            io.to(receiver).emit("chat_message", { sender, message }); // 방으로 전송
        });

        socket.on("disconnect", () => {
            console.log("disconnect");
        });
    });
};
