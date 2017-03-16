# webchat应用

## 问题
+ 获取input标签应该即时获取,不能预先得到
+ 不能使用{webchat.name, webchat.content}在创建消息
+ fs.readFileSync(flie,options)读取的文件如果options(string|null)不设置，则默认为null，返回的是一个buffer,需要用JSON.parse()将其转化为JSON数据
+ 客户端实例化socket `var socket = io(url)`
+ date.getDay()得到今天星期几;date.getDate()得到今天是多少号
+ io.sockets.emit()向所有在线的用户发送行为
+ `background-size: cover;``浏览器就会按比例缩放背景图直至背景图宽高不小于容器的宽高（在上面的例子中，就是body标签）。

## 删除一个节点中的所有子节点
```
  var parentNode = document.getElementById('parentNode');

  while(parentNode.hasChildNodes){
    parentNode.removeChild(parentNode.firstChild);
  }
```
