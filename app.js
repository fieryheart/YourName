"use strict";

var fs = require('fs');
var express = require('express');
var app = express();

var config = JSON.parse( fs.readFileSync( 'config.json' ) ); //读取配置文件
var port = config.port;//端口号
var server = app.listen(port, '127.0.0.1');//监听
var io = require("socket.io")(server);//实例化一个socket
var people = [];//在线人数
app.use(express.static('node_modules'));//任意路径下加载node_modules中的文件
app.use('/static', express.static('public'));//在'/static'路径下加载public中的静态文件

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});//请求发送html文件

app.get('/history', (req, res) =>　{
  var historyAmount = config.historyNum;//备份消息条数
  var backup = fs.readFileSync(config.backupFile);
  var oldMessages = backup!==[] ? JSON.parse(backup) : [];
  var newMessages = oldMessages.length < historyAmount ? oldMessages : oldMessages.slice(oldMessages.length - config.historyAmount);

  res.send(JSON.stringify(newMessages));
})





io.on('connection', (socket) => {
    var user = '';
    var historyAmount = config.historyNum;//备份消息条数
    var backupFile = config.backupFile;//备份文件位置

    var backup = fs.readFileSync(config.backupFile);
    var oldMessages = backup!==[] ? JSON.parse(backup) : [];
    var newMessages = oldMessages.length < historyAmount ? oldMessages : oldMessages.slice(oldMessages.length - config.historyAmount);
    io.sockets.emit('updatePerson', people);//更新在线人数

    socket.on('sendMsg', (data) => {
        let message = new Message(data);

        if(newMessages.length === historyAmount){
          newMessages.shift();
        }

        backupMsg(message)//备份消息

        newMessages.push(message);//将新消息加入消息列表
        io.sockets.emit("sendNewMsg", newMessages);//发出消息
    });

    socket.on('newPerson', (person) => {
      user = person;
      if( !people.find((member) => member === person) ){
        people.push(person);
        io.sockets.emit('updatePerson', people);
        io.sockets.emit('sendNewSystemMsg', {content: person + '  尝过了口嚼酒,进入宫水神社',time: nowTime(), name:'系统消息'});
      }
    });

    socket.on('offline', (nicknames) => {
      if(user != ''){
        nicknames.forEach((nickname) => {
          people.forEach((value, index) => {
            if(value === nickname){
              people.splice(index, 1);
              io.sockets.emit('sendNewSystemMsg',{content: nickname + '  忘记了你的名字',time: nowTime(), name:'系统消息'});
            }
          })
        });
        io.sockets.emit('updatePerson', people);
      }
    })
})

//获取当前时间
function nowTime(){
  var date = new Date();
  return date.getFullYear() + '-' + (date.getMonth()+1) + '-' +　date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

//消息类
function Message(data){
  this.name = data.name;
  this.content = data.content;
  this.time = nowTime();
}

//备份消息
function backupMsg(message){
  var backup = fs.readFileSync(config.backupFile);
  var messages = backup!==[] ? JSON.parse(backup) : [];//读取example.json文件
  var str = '[\n'
  messages.push(message);
  messages.forEach((value, index) => {
    if(index !== 0){
      str += ',\n';
    }
    str += '  {\n   "name":"' + value.name + '",\n  "time":"' + value.time + '",\n  "content":"' + value.content + '"\n   }';
  });
  str += '\n]';

  fs.writeFile(config.backupFile, str, (err) => {
    if(err) {
      console.log("fail write :" + str + "  " + nowTime() + "\n error:" + err);
    }
  })
}
