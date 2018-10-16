var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var express = require('express');
var socketUsers = {};
var userState = {};
var surveyQ = require('./survey1.json');

var onlineUsers =[];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Client/index.html');
});

http.listen(80, function(){
  console.log('listening on *:80');
});



app.get('/notify',function(req,res){
    socketUsers["gmallya"].emit('chat message',"I send notification","Bot");
    res.json({code:200});
});

io.on('connection', function(socket){
    let ldapID = socket.handshake.query.name;
    socket.userLdapID = ldapID;
    //console.log(socket.handshake);
    //console.log(socket);
    //console.log('a user connected : '+ ldapID);
    onlineUsers.push(ldapID);
    socketUsers[ldapID] = socket;
    userState[ldapID] = 0;

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
        //console.log(socketUsers[socket.userLdapID]);
        //io.emit('chat message', msg,socket.userLdapID);
        
        var newMsgID =  GetNextQuestionID(userState[ldapID],GetOptionID(userState[ldapID],msg));
       
        var newMsg  = GetNextQuestion(newMsgID);
        userState[ldapID] = newMsgID;
     
       
        socketUsers[socket.userLdapID].emit('chat message' , newMsg,"Bot");
      });
  });


function GetNextQuestionID(qID,oID){
    //console.log(qID,oID);
    console.log(_.findIndex(surveyQ.survey1,function(Item){
        return (Item.qId == qID)
    }));
    var QuestionID = surveyQ.survey1[_.findIndex(surveyQ.survey1,function(Item){
        return (Item.qId == qID)
    })];
    if(!QuestionID){
        return -1;
    }else{
        if(oID == -1){
            return QuestionID.NextQID;
        }else{
            return QuestionID.NextQID[oID];
        }
        
    };
};

function GetOptionID(qID,optionMsg){
    console.log(qID,optionMsg);
    if(surveyQ.survey1[_.findIndex(surveyQ.survey1,function(item1){
        return (item1.qId == qID)
    })].NextQID.constructor === Array){
        if(optionMsg.toLowerCase().includes("yes")){
            return 0;
        }else{
            return 1;
        }
    }else{
        return -1;
    }
    
}

function GetNextQuestion(qID){

    if(qID==-1){
        return "Thank you for your time. Your inputs are appreciated and it will help us to continue to create a healthy and productive work environment.We may have a member of the ERC reach out to you if we need any further clarification Incase you want to have any further queries or would like to discuss any of your inputs shared with me in detail r , pls reach out to ERC at erc@adobe.com"
    }else{
        return surveyQ.survey1[_.findIndex(surveyQ.survey1,function(item2){
            return (item2.qId == qID)
        })].Question;
    }
}