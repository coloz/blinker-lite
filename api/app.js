const { Devices } = require('../models');

const fastify = require('fastify')({ logger: true });

fastify.get('/ping', async (request, reply) => {
    reply.send('pong');
});

// 获取设备列表
fastify.get('/device/all', async (request, reply) => {
    try {
        const devices = await Devices.query();
        reply.send(devices);
    } catch (err) {
        reply.code(500).send(err);
    }
});

// 创建设备
fastify.post('/device/new', async (request, reply) => {
    try {
        const device = await Devices.query().insert({
            config: {
                "name": "新的设备",
                "dashboard": [],
                "image": '',
                "mode": ["mqtt"],
                "location": []
            }
        });
        reply.send(device);
    } catch (err) {
        reply.code(500).send(err);
    }
});

// 删除设备
fastify.delete('/device/:id', async (request, reply) => {
    try {
        const numDeleted = await Devices.query().deleteById(request.params.id);
        reply.send('ok');
    } catch (err) {
        reply.code(500).send(err);
    }
})

// 修改设备配置
fastify.patch('/device/:id', async (request, reply) => {
    try {
        const device = await Devices.query().patchAndFetchById(request.params.id, request.body)
        reply.send(device);
    } catch (err) {
        reply.code(500).send(err);
    }
})

fastify.listen({ port: 3000 }).then(() => {
    console.log('Server listening on port 3000');
})