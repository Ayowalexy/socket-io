import express from 'express';
import { Server } from "socket.io";
import { createServer } from "http";
import connectDB from "./connectdb.js";
import { Messsage, User } from './model.js';

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

connectDB();

app.post('/user', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.sendStatus(200)
})

app.get('/user', async (req, res) => {
    const user = await User.find();
    res.send(user)
})

app.delete('/messages', async(req, res) => {
    await Messsage.deleteMany({});
    res.sendStatus(200)
})


const saveNewMessage = async (message, senderId, receiverId) => {
    const newMessage = new Messsage({
        message,
        receiver: receiverId,
        sender: senderId,
        users: [senderId, receiverId]
    })
    await newMessage.save();
    const messages = await Messsage.find({ users: { $all: [senderId, receiverId] } })
    return messages
}


const getAllMessages = async (senderId, receiverId) => {
    const messages = await Messsage.find({ users: { $all: [senderId, receiverId] } })
    return messages
}

io.on('connection', socket => {
    console.log('socket id', socket.id)
    socket.on('room', async (room) => {
        const senderId = room.split('-')[0];
        const receiverId = room.split('-')[1];
        socket.join(room);
        const allMessages = await getAllMessages(senderId, receiverId);
        io.to(room).emit('allMessage', allMessages);
    })

    socket.on('sendMessageToRoom', async ({ roomName, message }) => {
        const senderId = roomName.split('-')[0];
        const receiverId = roomName.split('-')[1];
        const allMessages = await saveNewMessage(message, senderId, receiverId);
        io.to(roomName).emit('newMessage', allMessages);
    });
})


const PORT = process.env.PORT || 5000;


httpServer.listen(PORT, console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
));

