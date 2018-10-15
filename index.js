var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var express = require('express');
var socketUsers = {};


var onlineUsers =[];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Client/index.html');
});

http.listen(80, function(){
  console.log('listening on *:80');
});





io.on('connection', function(socket){
    let ldapID = socket.handshake.query.name;
    socket.userLdapID = ldapID;
    //console.log(socket.handshake);
    //console.log(socket);
    //console.log('a user connected : '+ ldapID);
    onlineUsers.push(ldapID);
    socketUsers[ldapID] = socket;

    console.log("Online Users :: ");
    console.log(onlineUsers)
    
    socket.on('disconnect', function(){
        console.log(socket.userLdapID + ' disconnected');
        _.remove(onlineUsers, function(n) {
            if(n){
                return n.toLowerCase() == socket.userLdapID.toLowerCase();
            }
            
          });
        console.log("Online Users :: ");
        console.log(onlineUsers)
      });
      socket.on('chat message', function(msg){
        console.log('message by '+socket.userLdapID+': ' + msg);
        console.log(socketUsers[socket.userLdapID]);
        //io.emit('chat message', msg,socket.userLdapID);
        socketUsers[socket.userLdapID].emit('chat message' , msg,"Bot");

      });
  });