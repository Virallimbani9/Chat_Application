const http = require("http");
const express = require('express')
const session = require('express-session');
const flash = require("express-flash");
const app = express()
const path = require('path');
const port = 3000
const db = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const adminRouter=require('./router/admin/admin.routes');
const userRouter = require('./router/user/user.routes');
const User = require('./model/user/user');
const Chat = require('./model/user/chat');
const server = http.createServer(app);
const socketIO = require("socket.io");

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));


app.use(
  session({
    secret: process.env.SE,
    resave: false,
    saveUninitialized: true,
    expires: new Date(Date.now() + 30 * 86400 * 1000),
    cookie: { maxAge: 30 * 86400 * 1000 },
  })
);

app.use(flash());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

db()

//------------------ ADMIN --------------------
app.use('/admin', adminRouter)


//------------------ USER ---------------------
app.use('/user', userRouter)
app.use('/',userRouter)



//------------------- SOKCET -------------------
const io = socketIO(server);
let usp = io.of("/user");

usp.on("connection", async (socket) => {
  console.log("User Connected");
  let userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { is_online: true } }
  );

  socket.broadcast.emit("getOnlineUser", { userId: userId });

  socket.on("disconnect", async () => {
    console.log("User Diconnected");
    let userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate(
      { _id: socket.handshake.auth.token },
      { $set: { is_online: false } }
    );
    socket.broadcast.emit("getOfflineUser", { userId: userId });
  });

  socket.on("newChat", (data) => {
    socket.broadcast.emit("loadNewChat", data);
  });

  //------------load old chat-------------//
  socket.on("existsChat", async (data) => {
    let chats = await Chat.find({
      $or: [
        {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
        },
        {
          sender_id: data.receiver_id,
          receiver_id: data.sender_id,
        },
      ],
    });
    socket.emit("loadChats", { chats: chats });
  });


  //--------------- Group Chat -------------
socket.on("newGroupChat", (data) => {
    socket.broadcast.emit("loadNewGroupChat",data);
});
});




server.listen(port, () => console.log("Ready to go!"))


