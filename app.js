const fastify = require('fastify')({ logger: true });

// 模拟的数据库
const devices = [];

// 获取所有设备的状态
fastify.get('/devices', (request, reply) => {
  reply.send(devices);
});

// 向数据库添加新设备
fastify.post('/devices', (request, reply) => {
  const device = request.body;
  devices.push(device);
  reply.send({ status: 'success', data: device });
});

// 获取指定设备的状态
fastify.get('/devices/:deviceId', (request, reply) => {
  const deviceId = request.params.deviceId;
  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    reply.status(404).send({ status: 'error', message: 'Device not found' });
    return;
  }
  reply.send(device);
});

// 更新指定设备的状态
fastify.put('/devices/:deviceId', (request, reply) => {
  const deviceId = request.params.deviceId;
  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    reply.status(404).send({ status: 'error', message: 'Device not found' });
    return;
  }
  Object.assign(device, request.body);
  reply.send({ status: 'success', data: device });
});

// 删除指定设备
fastify.delete('/devices/:deviceId', (request, reply) => {
  const deviceId = request.params.deviceId;
  const index = devices.findIndex(d => d.id === deviceId);
  if (index === -1) {
    reply.status(404).send({ status: 'error', message: 'Device not found' });
    return;
  }
  devices.splice(index, 1);
  reply.send({ status: 'success' });
});

// 启动服务器
fastify.listen(3000, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});