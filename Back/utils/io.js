const userController = require("../Controllers/user.controllers");
const User = require("../Models/user");

// module.exports = function (io) {
//     io.on("connection", async (socket) => {
//         console.log("connected", socket.id);

//         socket.on("login", async (user, partner, cb) => {
//             console.log("user", user);
//             try {
//                 const userdata = await userController.saveUser(user, socket.id);
//                 socket.join(user); // ✅ 자기 이름으로 방 참여
//                 cb({ ok: true, data: userdata });
//             } catch (error) {
//                 cb({ ok: false, error: error.message });
//             }
//         });
        

//         socket.on("chat_message", (data) => {
//             const { sender, receiver, message } = data;
//             console.log(`From ${sender} to ${receiver}: ${message}`);
        
//             io.to(receiver).emit("chat_message", { sender, message }); // 방으로 전송
//         });

//         socket.on("disconnect", () => {
//             console.log("disconnect");
//         });
//     });
// };
module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log("connected", socket.id);

        socket.on("login", async (user, partner, cb) => {
            console.log("✅ 로그인 성공:", user, "파트너:", partner);
            try {
                const userdata = await userController.saveUser(user, socket.id);
                socket.join(user); // ✅ 자기 이름으로 방 참여
                // socket.join(partner); // ✅ 상대방 방에도 참여 (중요!)
                cb({ ok: true, data: userdata });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });

        socket.on('join',(userId, partnerId) =>{
            socket.join(userId); // ✅ 자기 이름으로 방 참여
            socket.join(partnerId); // ✅ 상대방 방에도 참여 (중요!)
        });

        socket.on("chat_message", (data) => {
            const { sender, receiver, message } = data;
            console.log(`From ${sender} to ${receiver}: ${message}`);
            io.to(receiver).emit("chat_message", { sender, message });
        });

        socket.on("offer", (data) => {
            const { caller_id, receiver_id, call_id, sdp } = data;
        
            console.log(`📡 Offer 전송: ${caller_id} -> ${receiver_id}`, sdp);
        
            // ✅ `type: "offer"` 속성이 없을 경우 추가
            const fixedSdp = {
                type: "offer",
                sdp: sdp.sdp, // 원본 sdp 값 유지
            };
        
            io.to(receiver_id).emit("offer", { from: caller_id, call_id, sdp: fixedSdp });
        
            console.log(`📡 Offer를 ${receiver_id}에게 보냈습니다!`, fixedSdp);
        });
        
        socket.on("answer", (data) => {
            const { caller_id, receiver_id, sdp } = data;
            console.log("✅ [서버] answer 수신:", data);
            console.log(`📡 Answer 전송: ${caller_id} -> ${receiver_id}`);

            // 🔍 여기 로그가 안 찍히면 emit이 안 오고 있는 것!
            if (!receiver_id) {
                console.warn("🚨 receiver_id 없음! 데이터를 확인하세요:", data);
                return;
            }

            io.to(receiver_id).emit("answer", { from: caller_id, sdp });
        });

        socket.on("disconnect", () => {
            console.log("disconnect");
        });

        socket.on("call_end", (data) => {
            const { call_id, receiver_id } = data;
            io.to(receiver_id).emit("call_end", { call_id });
        });

        socket.on("incoming_call", (data) => {
            const { caller_id, receiver_id, call_id } = data;
            console.log(`📞 통화 요청: ${caller_id} -> ${receiver_id}`);
            // 🔥 본인을 제외한 상대방에게만 전송
            socket.to(receiver_id).emit("incoming_call", { caller_id, call_id });
        });

        socket.on("ice_candidate", (data) => {
            const { call_id, candidate, receiver_id, caller_id } = data;
            console.log(`❄️ ICE candidate 전송: ${caller_id} -> ${receiver_id}`);
            socket.to(receiver_id).emit("ice_candidate", { call_id, candidate });
        });
        
        socket.on("call_answer", (data) => {
            const { caller_id, call_id } = data;
            console.log(`📞 ${caller_id}의 통화 수락`);
            socket.to(caller_id).emit("call_answer", { call_id });
        });
        
        socket.on("call_reject", (data) => {
            const { caller_id, call_id } = data;
            console.log(`📞 ${caller_id}의 통화 거절`);
            socket.to(caller_id).emit("call_reject", { call_id });
        });

    });
};

