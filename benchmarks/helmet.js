const fastify = require('fastify');
const helmet = require('hpkp');
const { host, port, path, rsp } = require('./config');

fastify()
	.use(helmet({
		maxAge: 30 * 24 * 60 * 60,
		sha256s: ['AbCdEf123=', 'ZyXwVu456=']
	}))
	.get(path, (request, reply) => {
		reply.send(rsp);
	})
	.listen(port, host);
