const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  localStream = stream;
  localVideo.srcObject = stream;
  socket.emit("join");
});

socket.on("offer", async (offer) => {
  peerConnection = createPeerConnection();
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  await peerConnection.setRemoteDescription(answer);
});

socket.on("candidate", async (candidate) => {
  if (candidate) await peerConnection.addIceCandidate(candidate);
});

socket.on("ready", async () => {
  peerConnection = createPeerConnection();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
});

function createPeerConnection() {
  const pc = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  pc.ontrack = event => remoteVideo.srcObject = event.streams[0];
  pc.onicecandidate = event => {
    if (event.candidate) socket.emit("candidate", event.candidate);
  };
  return pc;
}

function sendMessage() {
  const msg = messageInput.value;
  socket.emit("message", msg);
  appendMessage("Siz: " + msg);
  messageInput.value = "";
}

socket.on("message", msg => appendMessage("U: " + msg));

function appendMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  messages.appendChild(div);
}

