const fastify = require('fastify');
const self = require('../src/index');
const { host, port, path, rsp } = require('./config');

fastify()
	.register(self, {
		maxAge: 30 * 24 * 60 * 60,
		sha256s: ['AbCdEf123=', 'ZyXwVu456=']
	})
	.get(path, (request, reply) => {
		reply.send(rsp);
	})
	.listen(port, host);
