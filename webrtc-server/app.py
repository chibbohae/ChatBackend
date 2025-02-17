from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)  # CORS 허용
socketio = SocketIO(app, cors_allowed_origins="*")  # WebSocket 설정

# 현재 연결된 클라이언트 관리
connected_clients = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('✅ Client connected:', request.sid)
    connected_clients[request.sid] = request.sid
    emit('connected', {'message': 'Connected to WebSocket server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('❌ Client disconnected:', request.sid)
    if request.sid in connected_clients:
        del connected_clients[request.sid]

# 📞 WebRTC 시그널링 이벤트 (offer 전달)
@socketio.on('offer')
def handle_offer(data):
    print(f"📨 Offer received from {data['from']} to {data['to']}")
    # 해당 userId 방에 offer 전달
    emit('offer', data, room=data['to'])

# 📞 WebRTC 시그널링 이벤트 (answer 전달)
@socketio.on('answer')
def handle_answer(data):
    print(f"📨 Answer received from {data['from']} to {data['to']}")
    # 해당 userId 방에 answer 전달
    emit('answer', data, room=data['to'])

# 📡 ICE Candidate 전달
@socketio.on('candidate')
def handle_candidate(data):
    print(f"📡 ICE Candidate received from {data['from']} to {data['to']}")
    # 해당 userId 방에 candidate 전달
    emit('candidate', data, room=data['to'])

# 🔄 클라이언트가 방을 생성 (사용자 ID 기반)
@socketio.on('join')
def handle_join(data):
    user_id = data.get("userId")
    if user_id:
        join_room(user_id)
        print(f"👤 User {user_id} joined room")
        emit("joined", {"message": f"Joined room {user_id}"}, room=user_id)

# 🔄 클라이언트가 방을 떠날 때 (통화 종료)
@socketio.on('leave')
def handle_leave(data):
    user_id = data.get("userId")
    if user_id:
        leave_room(user_id)
        print(f"👤 User {user_id} left room")
        emit("left", {"message": f"User {user_id} left the room"}, room=user_id)

if __name__ == '__main__':
    print('🚀 WebRTC Signaling Server Running...')
    socketio.run(app, host='0.0.0.0', port=8000)
