# webchat从捕获腾讯云服务器开始到获得域名到部署的过程.md

## 需要的原材料
+ 腾讯云服务器一只
+ （本机为windows操作系统时）WinSCP一勺 和 PuTTY一撮
+ 域名一名
+ 加点postman的chrome应用更是极好的

## 那么下面就是结合资料进行烹调了
### 首先是获得腾讯服务器的过程  
> 参考官方手册:  
> https://www.qcloud.com/document/product/213/2972  
> 我的用的是Ubuntu系统  
> 跟着官方走一直到步骤四能打开Putty回话为止  

### 然后是在服务器上配置环境了
> 由于后端用的是NodeJS,所以我只找关于腾讯云、NodeJS和Nginx搭配用的文档  
> 期间碰到访问权限问题啊，vim编辑器问题啊以及各种ubuntu基本文件操作的问题啊都是随手一查的，就不给参考文档了  
> http://blog.suzper.com/2016/10/26/%E8%85%BE%E8%AE%AF%E4%BA%91+nginx%E9%83%A8%E7%BD%B2nodejs%E5%BA%94%E7%94%A8(%E4%B8%80)/#more  
> 上面链接除了在mac上生成秘钥外，其他的和windows操作系统如出一辙  
> 上面链接内容一直到“部署web项目”基本可以按照步骤来  
> 期间的PCRE、openssh、zlib有个别安装包的链接有错误，可以自行google，还有每个安装包版本问题自己更新
> 最重要的是在zlib中的make install要成功，不然你就无法启动nginx  
> 如果make install 有问题可以比较这参考下面的链接     
> http://lcl088005.iteye.com/blog/2236278  

### 环境搭配好了就是nginx的配置了
> 进入/usr/local/nginx/conf（前提是你环境已经配好）用命令vim打开nginx.conf文件，然后就可以编辑了  
> 编辑内容的参考链接又一下：  
> https://www.nginx.com/blog/nginx-nodejs-websockets-socketio/  
> 注意将nginx的proxy_pass 指向你的NodeJS监听的端口  
> 注意将nginx的协议升级成websocket协议  
> 打开两个Putty，一个执行node app.js，另一个启动nginx  
> 当腾讯云给你的外网ip地址你能访问到时就成功了

### 然后是腾讯云的域名购买了
> 到腾讯云上面购买域名  
> 然后域名解析，即将域名和外网ip绑定在一起  
> 参考文档  
> http://bbs.qcloud.com/thread-8022-1-1.html  

## 以下是我在部署时需要改动代码中的情况
1. 改变请求URL
2. 用户输入的内容中有回车时会让json文件存储错误，做法是用replace(/\n/, "\\n")
3. 返回历史消息是解析字符串要将换行解析出来，做法是用
replace(/\\n/, "\n")，同时不要是使用createTextNode来创建文本节点，用innerText

## 最后是我的一点感想
当你不了解一个网站搭建的过程的时候，真的是不知道该怎么做。首先就是后端语言搭配的选择，之前一直在php和apache之间纠结，结果才反应过来我用的是nodejs；然后是ubuntu系统的陌生性，权限啊文件目录啊什么的都不知道；别人是怎么安装包的，我在搭配环境的时候还一度在直接apt-get install系统配置和wget下载
安装包自行配置之间驻足，实在是没有智力；然后就是到了nginx代理的配置了，在最初还不知道websocket协议的特殊性，寻找资料的并没有对症下药，现在想起来还真是迷茫；到部署成功之后，对bug的修复get到了用户输入回车时的弊病；  
总的来说，没有放弃真的是太好了，部署的时间历时3天，其间碰到的坑一个一个的踩一个一个的填，最后所幸不负对自己的希望，唯一感到遗憾的是，这个过程在停步不前的时候遇到了百度的面试，实属不幸啊，唉，算了，反正已成事实，鸡就是鸡啊，不过也是这样，我还有很多需要学习的地方，补漏查缺，Oh~nice 放狗！
