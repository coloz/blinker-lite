const Aedes = require('aedes')
const net = require('net')

async function init() {
  broker = new Aedes()
  const server = net.createServer(broker.handle);
  server.listen(1883, () => {
    console.log('启动mqtt服务 端口：1883')
  })
  transponder();
}

function transponder(options = {}) {
  // 检查订阅topic是否合法
  broker.on('subscribe', async (subscriptions, client) => {
    if (!checkSubscribeTopic(client.id, subscriptions[0].topic)) {
      console.log(client.id, '订阅topic非法');
      client.close();
      return;
    }
  })

  // 处理数据转发
  broker.on('publish', async (packet, client) => {
    // console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + broker.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic)
    if (!client) return;
    // 检查是否为toDevice 或 toGroup
    if (packet.payload.indexOf('"toDevice":') < 0 && packet.payload.indexOf('"toGroup":') < 0) return
    // 检查是否超出发送频率
    if (!checkFrequency(client.id)) {
      client.close();
      return;
    }
    // 检查数据格式是否合法
    let dataStr = packet.payload.toString();
    if (!checkData(dataStr)) {
      console.log(dataStr);
      console.log('数据非法');
      client.close();
      return;
    }
    let data = JSON.parse(dataStr)
    // 检查topic是否合法  
    if (!checkPublishTopic(client.id, packet.topic)) {
      console.log(packet.topic);
      console.log('topic非法');
      client.close();
      return;
    }
    // 检查数据长度是否合法  
    if (dataStr.length > 1024) {
      client.close();
      return;
    }
    // 发送data
    console.log(`\x1b[0m${packet.topic}: \x1b[33m${dataStr}`);
    if (dataStr.indexOf('"toDevice":') > -1) {
      // 数据转发鉴权：检查fromDevice\toDevice是否合法
      if (await checkDeviceInSameGroup(client.id, data.toDevice)) {
        send2Device(data.data, client.id, data.toDevice);
      }
    } else if (dataStr.indexOf('"toGroup":') > -1) {
      // 数据转发鉴权：检查fromDevice\toGroup是否合法
      if (await checkDeviceInGroup(client.id, data.toGroup)) {
        send2Group(data.data, client.id, data.toGroup)
      }
    }
  })
}

// 转发消息到指定设备  
function send2Device(message, fromDevice, toDevice) {
  let data = JSON.stringify({
    fromDevice: fromDevice,
    data: message
  })
  broker.publish({
    cmd: 'publish',
    qos: 0,
    dup: false,
    topic: `/device/${toDevice}/r`,
    payload: data,
    retain: false
  }, error => {
    if (error != null) console.log(error);
  })
  redis.set('temp-device', data, 'EX', 86400)
}

// 转发消息到指定组  
function send2Group(message, fromDevice, toGroup) {
  let data = JSON.stringify({
    fromDevice: fromDevice,
    fromGroup: toGroup,
    data: message
  })
  broker.publish({
    cmd: 'publish',
    qos: 0,
    dup: false,
    topic: `/group/${toGroup}/r`,
    payload: data,
    retain: false
  }, error => {
    if (error != null) console.log(error);
  })
  redis.set('temp-device', data, 'EX', 86400)
}

function checkData(dataStr) {
  let data;
  try {
    data = JSON.parse(dataStr)
  } catch (error) {
    console.log("非json");
    return false
  }
  if ((typeof data.toDevice == 'undefined' && typeof data.toGroup == 'undefined') || typeof data.data == 'undefined')
    return false
  return true
}

init();