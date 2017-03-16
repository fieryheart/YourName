"use strict";

const socketURL='http://127.0.0.1:8080';
var socket = io(socketURL);//链接域名

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
    socket.emit('newPerson', name);
    socket.emit('sendMsg', {name, content});
  }

  //清空textarea标签的内容
  getContent().value = '';
}

document.onKeyDowm = function(event){
  var e = event || window.event || arguments.callee.caller.arguments[0];
  if(e && e.keyCode){
    sendMsg();
  }
}

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

socket.on('sendNewMsg', (newMessages) => {
    let newMessage = newMessages[newMessages.length - 1];
    let li = document.createElement('li');
    let head = document.createElement('h3');
    let p = document.createElement('p');
    let headText = document.createTextNode(newMessage.name + '  ' + newMessage.time);
    let pText = document.createTextNode(newMessage.content);
    li.setAttribute('class', 'user');
    p.setAttribute('class', 'userContent');
    head.appendChild(headText);
    p.appendChild(pText);
    li.appendChild(head);
    li.appendChild(p);
    message.appendChild(li);
});

socket.on('sendNewSystemMsg', (systemMsg) => {
    let li = document.createElement('li');
    let head = document.createElement('h3');
    let p = document.createElement('p');
    let headText = document.createTextNode(systemMsg.name + '  ' + systemMsg.time);
    let pText = document.createTextNode(systemMsg.content);
    li.setAttribute('class', 'system');
    p.setAttribute('class', 'systemMsg');
    head.appendChild(headText);
    p.appendChild(pText);
    li.appendChild(head);
    li.appendChild(p);
    message.appendChild(li);
})