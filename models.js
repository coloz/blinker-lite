const { Model } = require('objection');
const guid = require('objection-guid')();
const Knex = require('knex');

const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './sqlite.db'
    }
});

Model.knex(knex);

class Users extends guid(Model) {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['config'],
            properties: {
                id: { type: 'string' },
                config: { type: 'object' },
            }
        };
    }
}

class Devices extends guid(Model) {
    static get tableName() {
        return 'devices';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['config'],
            properties: {
                id: { type: 'string' },
                config: { type: 'object' },
            }
        };
    }
}

module.exports = { Devices, knex };