const async = require("async");
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
  },
});

const users = {}

io.on('connection', socket => {
  const worker = function(task , callback){
    console.log("Message  :=>  "+task.message);
    callback();
  }
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
    queue.push({message:"A new user is connected name :"+name})
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
    queue.push({message:"Message from "+ users[socket.id]})
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    queue.push({message: users[socket.id] + "is Disconnected !"});
    delete users[socket.id]
  })
  const queue = async.queue(worker,1)
});
// queue.drain(()=>{
//   console.log("All the tasks in queue are processed  !");
// })
server.listen(5000, () => {
  console.log("SERVER RUNNING");
});
