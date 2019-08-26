//引入net模块
const net = require("net");
//创建服务
const server = net.createServer();
//声明用户列表
const clientList = [];

var usocket = "";

//用户连接
server.on("connection", function(socket) {
  //把用户的socket存入列表
  socket.on("data", function(data) {
    //判断是否属于询问加入群聊状态
    if (socket.ask == "true") {
      //同意群聊
      if (JSON.parse(data.toString().replace("\\n", "")).message == "y") {
        socket.write("你加入了群聊");
        socket.qunliao = "y"; //赋予群聊属性
      }
      //拒绝群聊
      else if (JSON.parse(data.toString().replace("\\n", "")).message == "n") {
        socket.write("你拒绝了群聊");
      }
      socket.ask = "false";
    } else {
      //正则验证是否开启群聊
      var reg = data.toString().match(/\/(\w+,)+\w+\//);
      //验证成功
      if (reg != null) {
        var res = reg[0];
        res = res.replace(/\//g, "");
        //截取群聊的人的名字
        qname = res.split(",");
        //把人名和socket进行对应
        for (var i = 0; i < qname.length; i++) {
          for (var j = 0; j < clientList.length; j++) {
            //判断其他人是否愿意加入群聊
            if (
              qname[i] == clientList[j].name &&
              socket.name != clientList[j].name
            ) {
              clientList[j].ask = "true";
              socket.qunliao = "y";
              clientList[j].write(
                socket.name + "邀请你加入群聊，是否同意？y/n"
              );
            }
          }
        }
      } else {
        //判断初始状态是否为群聊
        if (socket.qunliao == "y") {
          //开始群聊
          qunliao(socket, data);
        } else {
          usocket = JSON.parse(data.toString().replace("\\n", ""));
          //判断是否为登录状态
          if (usocket.type == "login") {
            socket.name = usocket.name; //在socket对象中声明一个name属性并把用户的名字赋值给它
            socket.write("Login Success");
            console.log(socket.remoteAddress + ":" + socket.remotePort);
            clientList.push(socket); //存入socket对象
          } else if (usocket.type == "one") {
            //私聊状态
            var oname = usocket.message
              .split("\n")[0]
              .split(":")[0]
              .substr(1); //用户名
            var message = usocket.message.split("\n")[0].split(":")[1]; //聊天内容
            oneChat(oname, socket, message);
          } else if (usocket.type == "all") {
            //广播
            var message = usocket.message;
            broadcast(message, socket);
          }
        }
      }
    }
  });

  socket.on("end", function() {
    clientList.splice(clientList.indexOf(socket), 1);
  });
});

//监听端口
server.listen(
  {
    host: "192.168.28.51",
    port: 8080
  },
  function() {
    console.log("opened server on", server.address());
  }
);

//广播
function broadcast(message, socket) {
  for (var i = 0; i < clientList.length; i++) {
    //发送给其他人
    var msg = socket.name + " 对所有人: " + message;
    clientList[i].write(msg);
  }
}

// 私聊
function oneChat(oname, socket, message) {
  for (var i = 0; i < clientList.length; i++) {
    if (oname == clientList[i].name.split("\n")[0]) {
      var msg = socket.name + " 偷偷对你说: " + message;
      clientList[i].write(msg);
    }
  }
}

//群聊
function qunliao(socket, data) {
  for (var k = 0; k < clientList.length; k++) {
    if (clientList[k].qunliao == "y") {
      clientList[k].write(
        socket.name +
          "在[" +
          qname.join(",") +
          "]群聊中说：" +
          JSON.parse(data.toString().replace("\\n", "")).message
      );
    }
  }
}
