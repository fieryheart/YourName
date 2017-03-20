"use strict";

const socketURL='http://127.0.0.1:8080';
var socket = io(socketURL);//链接域名
var nicknames = [];//存储输入的昵称
var personNum = document.getElementById('person-num');
var personList = document.getElementById('person-list');
var message = document.getElementById('message');
var send = document.getElementById('send');

var getName = () => document.getElementById('name');//input标签对象应该即时获取
var getContent = () => document.getElementById('content');

send.addEventListener('click', sendMsg, false);
function sendMsg(){

  let name  = getName().value.toString();//获取用户昵称

  let content = getContent().value.toString();//获取输入内容
  // console.log(content);

  //发送后端用户的到消息总的列表
  if(name && content){
    nicknames.push(name);
    socket.emit('newPerson', name);
    socket.emit('sendMsg', {name, content});
    //防止昵称改变
    getName().setAttribute("disabled", "disabled");
    getName().style.opacity = 0.5;
  }

  //清空textarea标签的内容
  getContent().value = '';
}

//页面初次加载时获取历史消息
function fetchHistory(){
  let req = new XMLHttpRequest();
  req.addEventListener("load", (res) => {
      let historyMessages = JSON.parse(res.currentTarget.responseText);
      historyMessages.forEach((historyMessage) => {
        let li = document.createElement('li');
        let head = document.createElement('h3');
        let p = document.createElement('p');
        let headText = document.createTextNode(historyMessage.name + '     ' + historyMessage.time);
        let pText = document.createTextNode(historyMessage.content);
        li.setAttribute('class', 'user');
        p.setAttribute('class', 'userContent');
        head.appendChild(headText);
        p.appendChild(pText);
        li.appendChild(head);
        li.appendChild(p);
        message.appendChild(li);
      })
      let history = document.createElement('li');
      let historyText = document.createTextNode('------这是他们相遇的故事------');
      history.setAttribute('class', 'system');
      history.appendChild(historyText);
      message.appendChild(history);
      message.scrollTop = message.scrollHeight;
    });

  req.open("GET", socketURL+"/history");
  req.send();
}

//页面关闭时在线人数离开,需要一个数组记录用过的昵称
window.addEventListener('unload', function(){
  socket.emit('offline', nicknames);
})

// 更新在线人数
socket.on('updatePerson', (people) => {
  personNum.innerHTML = people.length;

  while(personList.hasChildNodes()){
    personList.removeChild(personList.firstChild);
  }

  for(let i = 0; i < people.length; i++){
    let span = document.createElement('span');
    let text = document.createTextNode(people[i]);
    span.setAttribute('class', 'label');
    span.appendChild(text);
    personList.appendChild(span);
  }
});

//接受用户消息
socket.on('sendNewMsg', (newMessages) => {
    let newMessage = newMessages[newMessages.length - 1];
    let li = document.createElement('li');
    let head = document.createElement('h3');
    let p = document.createElement('p');
    let headText = document.createTextNode(newMessage.name + '      ' + newMessage.time);
    let pText = document.createTextNode(newMessage.content);
    li.setAttribute('class', 'user animated fadeIn');
    p.setAttribute('class', 'userContent');
    head.appendChild(headText);
    p.appendChild(pText);
    li.appendChild(head);
    li.appendChild(p);
    message.appendChild(li);
    message.scrollTop = message.scrollHeight;
});

//接收系统消息
socket.on('sendNewSystemMsg', (systemMsg) => {
    let li = document.createElement('li');
    let head = document.createElement('h3');
    let p = document.createElement('p');
    let headText = document.createTextNode(systemMsg.name + '     ' + systemMsg.time);
    let pText = document.createTextNode(systemMsg.content);
    li.setAttribute('class', 'system');
    p.setAttribute('class', 'systemMsg');
    head.appendChild(headText);
    p.appendChild(pText);
    li.appendChild(head);
    li.appendChild(p);
    message.appendChild(li);
})
