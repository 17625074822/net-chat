/*client.js*/
var net = require("net");
var client = net.connect("8080", "192.168.28.51");
var name = "";
client.on("connect", function() {
  process.stdout.write("your username:\n");
  //命令行收到用输入的指令
  process.stdin.on("data", function(data) {
    //判断登陆
    if (name == "") {
      name = data.toString();
      client.write(JSON.stringify({ name: name, type: "login" })); //把用户名和发送类型转成json发送给服务端
    }
    //当名字不为空,并且data的首字母是'@',则把聊天内容发送给服务端
    else if (data.toString()[0] == "@") {
      var message = data.toString();
      client.write(JSON.stringify({ message: message, type: "one" })); //私聊
    } else {
      var message = data.toString();
      client.write(JSON.stringify({ message: message, type: "all" })); //广播
    }
  });
});
client.on("data", function(data) {
  console.log(data.toString());
});
