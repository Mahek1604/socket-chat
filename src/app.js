const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require("socket.io");
const { generateMessage, generateLocationMessage } = require('../utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 4545;

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// let count = 0;

io.on('connection', (socket) => {
    console.log('New Connection...');

    //get message from client
    socket.on('join-group', ({ userName, groupName }, callBack) => {
        //addUser and if userexist send error
        const { error, user } = addUser({ 'id': socket.id, 'userName': userName, 'groupName': groupName })
        if (error) return callBack(error);

        //here user is join the group
        socket.join(user.groupName)

        //send message to single connection client
        socket.emit('serverMessage', generateMessage('Admin', 'Welcome Client!'));

        //broadcast is used to send a message to all connected clients except the sender
        socket.broadcast.to(user.groupName).emit('serverMessage', generateMessage('Admin', `${user.userName} has joined !`))

        //send groupName to client
        io.to(user.groupName).emit('groupData', {
            'groupname': user.groupName,
            'users': getUsersInRoom(user.groupName)
        })
    })

    //get message from client
    socket.on('chatMessage', (clientMessage, callBack) => {
        //get particular user to send data
        const user = getUser(socket.id);

        //io.emit send message for multiple connection
        io.to(user.groupName).emit('serverMessage', generateMessage(user.userName, clientMessage));
        callBack();
    })

    //get location from one of the clients to server
    socket.on('sendLocation', (coords, callBack) => {
        //get particular user to send data

        const user = getUser(socket.id);
        //server send to all the connected clients
        io.to(user.groupName).emit('locationMessage', generateLocationMessage(user.userName, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callBack('Location Shared !');
    })

    //when clients disconnect this method is called.
    socket.on('disconnect', () => {
        //remove particular user data
        const user = removeUser(socket.id)
        if (user) {
            //server send message to group or client
            io.to(user.groupName).emit('serverMessage', generateMessage('Admin', `${user.userName} has left !`))
            //send groupName to client
            io.to(user.groupName).emit('groupData', {
                'groupname': user.groupName,
                'users': getUsersInRoom(user.groupName)
            })
        }
    });
});

server.listen(port, () => {
    console.log(`Server Working On ${port}`);
});