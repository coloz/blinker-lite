const { Devices, knex } = require('../models');

async function createSchema() {
    if (await knex.schema.hasTable('devices')) {
        return;
    }
    await knex.schema.createTable('devices', table => {
        table.string('id').primary();
        table.json('config');
    });
}

async function run() {

    await Devices.query().insert([
        {
            config: {
                "username": "点灯物联"
            }
        }
    ]);

    await Devices.query().insert([
        {
            config: {
                "name": "新的设备",
                "dashboard": [],
                "image": '',
                "mode": ["mqtt"],
                "location": []
            }
        }
    ]);

    console.log('created:', result);
}

createSchema()
    .then(() => run())
    .then(() => knex.destroy())
    .catch(err => {
        console.error(err);
        return knex.destroy();
    });