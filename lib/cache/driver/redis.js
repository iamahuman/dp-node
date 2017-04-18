const redis = require('redis');
const Promise = require('bluebird');
const driver = require('./index');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = {
    conn: (connection) => {
        return redis.createClient(connection)
    },
    get: (conn, key, ttl) => {
        var tran = conn.multi();
        tran.get(key);

        if (typeof(ttl) == 'number') {
            tran.expire(key, ttl);
        }

        var res = await(tran.execAsync());
        return res[0] ? driver.payload.parse(res[0]) : null;
    },
    set: (conn, key, val, ttl) => {
        var tran = conn.multi();
        tran.set(key, driver.payload.stringify(val));

        if (typeof(ttl) == 'number') {
            tran.expire(key, ttl);
        }

        var res = await(tran.execAsync());
        return res[0] == 'OK';
    },
    del: (conn, key) => {
        return await(conn.del(key));
    },
    expire: (conn, key, ttl) => {
        var tran = conn.multi();
        tran.expire(key, ttl);

        var res = await(tran.execAsync());
        return res[0] == 1;
    },
    ttl: (conn, key) => {
        var tran = conn.multi();
        tran.ttl(key);

        var res = await(tran.execAsync());
        return res[0];
    }
}