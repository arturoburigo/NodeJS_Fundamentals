import knex from 'knex';

export const config = {
    client: 'sqlite3',
    connection: {
        filename: './tmp/app.db'
    },
    useNullAsDefault: true
};

export const db = knex(config);
