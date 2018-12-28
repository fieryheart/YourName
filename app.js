"use strict";

var fs = require('fs');
var express = require('express');
var app = express();

//读取配置文件
var config = JSON.parse( fs.readFileSync( 'config.json' ) );

// 端口号
var port = config.port;

// 服务器ip
var server = app.listen(port, '127.0.0.1');

//实例化一个socket
var io = require("socket.io")(server);


var people = [];//在线人数

//任意路径下加载node_modules中的文件
app.use(express.static('node_modules'));

//在'/static'路径下加载public中的静态文件
app.use('/static', express.static('public'));


//请求发送html文件
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 显示启动状态
// server.listen(app.get('port'), () => {
//   console.log(`connet success in 127.0.0.1:${port}`);
// })


// 
app.get('/history', (req, res) =>　{
  var historyAmount = config.historyNum;//备份消息条数
  var backup = fs.readFileSync(config.backupFile);
  var oldMessages = backup !== [] ? JSON.parse(backup) : [];
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
        let time = nowTime();
        people.push(person);
        io.sockets.emit('updatePerson', people);
        io.sockets.emit('sendNewSystemMsg', {content: person + '  进入宫水神社',time: time, name:'系统消息'});
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

const add0 = (val) => val < 10 ? `0${val}` : val;

//获取当前时间
function nowTime(){
  var date = new Date();
  return date.getFullYear() + '-' + add0(date.getMonth()+1) + '-' +　add0(date.getDate()) + ' ' + add0(date.getHours()) + ":" + add0(date.getMinutes()) + ":" + add0(date.getSeconds());
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
    str += '  {\n   "name":"' + value.name.replace(/\n/g,'') + '",\n  "time":"' + value.time + '",\n  "content":"' + value.content.replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\"/g,"&quot;") + '"\n   }';
  });
  str += '\n]';

  fs.writeFile(config.backupFile, str, (err) => {
    if(err) {
      console.log("fail write :" + str + "  " + nowTime() + "\n error:" + err);
    }
  })
}
